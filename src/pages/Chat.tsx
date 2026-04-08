import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { addOutline, logOutOutline, paperPlaneOutline } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isFeriaApiConfigured, listChatMessages } from '../api/feriaApi';
import { useAuth } from '../auth/AuthContext';
import './Chat.css';

type ChatMessageRole = 'user' | 'assistant' | 'system';

type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  pending?: boolean;
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

const chatWebSocketUrl = import.meta.env.VITE_CHAT_WS_URL;
const CONVERSATION_STORAGE_KEY = 'feria_active_chat_conversation_id';

const Chat: React.FC = () => {
  const { signOutUser, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Conectando...');
  const [conversationId, setConversationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CONVERSATION_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [historyLoading, setHistoryLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const conversationIdRef = useRef<string | null>(conversationId);

  conversationIdRef.current = conversationId;

  const displayName = useMemo(() => {
    return user?.email ?? user?.username ?? 'usuario';
  }, [user?.email, user?.username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!isFeriaApiConfigured() || !conversationId) {
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);

    void listChatMessages(conversationId, { limit: 100 })
      .then(({ messages: rows }) => {
        if (cancelled) {
          return;
        }
        const ui: ChatMessage[] = [];
        for (const row of rows) {
          if (row.role !== 'user' && row.role !== 'assistant') {
            continue;
          }
          ui.push({
            id: row.messageId,
            role: row.role as 'user' | 'assistant',
            content: row.content,
          });
        }
        setMessages(ui);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setMessages([]);
        setConversationId(null);
        try {
          localStorage.removeItem(CONVERSATION_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const connectWebSocket = useCallback(() => {
    if (!chatWebSocketUrl) {
      setConnectionStatus('Falta VITE_CHAT_WS_URL en el frontend.');
      return;
    }

    const ws = new WebSocket(chatWebSocketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('Conectado');
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsStreaming(false);
      activeRequestIdRef.current = null;
      setConnectionStatus('Desconectado');
    };

    ws.onerror = () => {
      setConnectionStatus('Error de conexion WebSocket.');
    };

    ws.onmessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') {
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(event.data) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = asString(parsed.type);
      const requestId = asString(parsed.requestId);

      if (!type || !requestId) {
        return;
      }

      if (type === 'chat.delta') {
        const text = asString(parsed.text) ?? '';

        if (!text) {
          return;
        }

        setMessages((prev) => {
          const existingIndex = prev.findIndex((m) => m.id === requestId && m.role === 'assistant');
          if (existingIndex === -1) {
            return [...prev, { id: requestId, role: 'assistant', content: text, pending: true }];
          }

          const next = [...prev];
          const previous = next[existingIndex];
          next[existingIndex] = {
            ...previous,
            content: `${previous.content}${text}`,
            pending: true,
          };
          return next;
        });

        return;
      }

      if (type === 'chat.done') {
        const outputText = asString(parsed.outputText);
        const cid = asString(parsed.conversationId);
        if (cid) {
          setConversationId(cid);
          try {
            localStorage.setItem(CONVERSATION_STORAGE_KEY, cid);
          } catch {
            /* ignore */
          }
        }

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== requestId || m.role !== 'assistant') {
              return m;
            }

            return {
              ...m,
              content: outputText ?? m.content,
              pending: false,
            };
          }),
        );

        if (activeRequestIdRef.current === requestId) {
          activeRequestIdRef.current = null;
          setIsStreaming(false);
        }

        return;
      }

      if (type === 'chat.error') {
        const message = asString(parsed.message) ?? 'Ocurrio un error en el stream.';

        setMessages((prev) => [
          ...prev,
          {
            id: `${requestId}-error`,
            role: 'system',
            content: message,
          },
        ]);

        if (activeRequestIdRef.current === requestId) {
          activeRequestIdRef.current = null;
          setIsStreaming(false);
        }
      }
    };
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connectWebSocket]);

  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    try {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const sendPrompt = useCallback(async () => {
    const prompt = draft.trim();
    if (!prompt || isStreaming) {
      return;
    }

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setConnectionStatus('Socket no conectado. Reintenta en unos segundos.');
      return;
    }

    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!idToken) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-auth`,
          role: 'system',
          content: 'No fue posible obtener el token de autenticacion.',
        },
      ]);
      return;
    }

    const requestId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    activeRequestIdRef.current = requestId;
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      { id: `${requestId}-user`, role: 'user', content: prompt },
      { id: requestId, role: 'assistant', content: '', pending: true },
    ]);

    const cid = conversationIdRef.current;
    ws.send(
      JSON.stringify({
        action: 'chat.start',
        requestId,
        prompt,
        idToken,
        ...(cid ? { conversationId: cid } : {}),
      }),
    );

    setDraft('');
  }, [draft, isStreaming]);

  return (
    <IonPage className="chat-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButton
            slot="start"
            fill="clear"
            aria-label="Nueva conversacion"
            onClick={startNewConversation}
            disabled={isStreaming}
          >
            <IonIcon icon={addOutline} slot="icon-only" />
          </IonButton>
          <IonTitle>Chat IA</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            aria-label="Cerrar sesion"
            onClick={() => {
              void signOutUser();
            }}
          >
            <IonIcon icon={logOutOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="chat-content">
        <div className="chat-shell">
          <div className="chat-meta">
            <IonText>
              <p className="chat-user">Sesion: {displayName}</p>
            </IonText>
            <IonText>
              <p className={`chat-status ${isConnected ? 'chat-status--ok' : 'chat-status--warn'}`}>
                {historyLoading ? 'Cargando historial...' : connectionStatus}
              </p>
            </IonText>
          </div>

          <div className="chat-feed" role="log" aria-live="polite">
            {messages.length === 0 && !historyLoading ? (
              <div className="chat-empty">
                <p>
                  Escribe una pregunta sobre tus finanzas. El asistente usa tu historial de movimientos
                  en la app (vía Amazon Bedrock).
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={`chat-bubble chat-bubble--${message.role}`}
                >
                  <p>{message.content || (message.pending ? '...' : '')}</p>
                </article>
              ))
            )}

            {isStreaming ? (
              <div className="chat-streaming">Recibiendo respuesta en tiempo real...</div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>
      </IonContent>

      <IonFooter className="chat-composer-footer">
        <div className="chat-composer">
          <IonTextarea
            autoGrow
            label="Mensaje"
            labelPlacement="stacked"
            value={draft}
            placeholder="Escribe aqui..."
            onIonInput={(event) => setDraft(String(event.detail.value ?? ''))}
          />
          <IonButton
            className="chat-send-btn"
            onClick={() => {
              void sendPrompt();
            }}
            disabled={!isConnected || isStreaming || draft.trim().length === 0 || historyLoading}
          >
            <IonIcon icon={paperPlaneOutline} slot="start" />
            Enviar
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default Chat;
