import {
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonTextarea,
  IonPage,
} from '@ionic/react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { addOutline, logOutOutline, paperPlaneOutline } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isFeriaApiConfigured, listChatMessages } from '../api/feriaApi';
import { useAuth } from '../auth/AuthContext';
import { FeriaAppShell } from '../components/FeriaAppShell';
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

/** Shown when there is no thread yet; tapping sends the question. */
const TUTOR_STARTER_PROMPTS: readonly string[] = [
  '¿Cómo puedo mejorar mis ahorros?',
  '¿Cómo puedo reducir mis gastos?',
  '¿Cómo armo un presupuesto mensual simple?',
  '¿Qué conviene revisar antes de fin de mes?',
  'Ideas para separar gastos fijos y variables',
  '¿Cómo interpretar mejor mis movimientos en la app?',
];

const Chat: React.FC = () => {
  const history = useHistory();
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
  const [signingOut, setSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutUser();
      history.replace('/login');
    } catch {
      setSigningOut(false);
    }
  };

  const sendMessage = useCallback(async (promptRaw: string) => {
    const prompt = promptRaw.trim();
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
  }, [isStreaming]);

  const sendPrompt = useCallback(() => {
    void sendMessage(draft);
  }, [draft, sendMessage]);

  return (
    <IonPage className="chat-page">
      <FeriaAppShell
        contentClassName="chat-content chat-content--tutor"
        headerEnd={
          <div className="chat-header-actions">
            <IonButton
              className="feria-icon-btn-quiet"
              fill="solid"
              shape="round"
              aria-label="Nueva conversacion"
              disabled={isStreaming}
              onClick={startNewConversation}
            >
              <IonIcon icon={addOutline} aria-hidden />
            </IonButton>
            <IonButton
              className="feria-icon-btn-quiet"
              fill="solid"
              shape="round"
              aria-label="Cerrar sesion"
              disabled={signingOut}
              onClick={() => {
                void handleSignOut();
              }}
            >
              {signingOut ? <IonSpinner name="crescent" /> : <IonIcon icon={logOutOutline} aria-hidden />}
            </IonButton>
          </div>
        }
      >
        <div className="tutor-layout">
          <div className="tutor-scroll">
            <div className="chat-shell">
              <div className="chat-meta">
                <IonText>
                  <p className="chat-user">Tutor · {displayName}</p>
                </IonText>
                <IonText>
                  <p
                    className={`chat-status ${isConnected ? 'chat-status--ok' : 'chat-status--warn'}`}
                  >
                    {historyLoading ? 'Cargando historial...' : connectionStatus}
                  </p>
                </IonText>
              </div>

              <div className="chat-feed" role="log" aria-live="polite">
                {messages.length === 0 && !historyLoading && !isStreaming ? (
                  <div className="tutor-empty-state">
                    <h2 className="tutor-empty-title">¿En qué te ayudo?</h2>
                    <p className="tutor-empty-sub">
                      El tutor usa tus movimientos registrados en Feria. Elige una sugerencia o escribe abajo.
                    </p>
                    <div className="tutor-starter-chips" role="group" aria-label="Preguntas sugeridas">
                      {TUTOR_STARTER_PROMPTS.map((label, index) => (
                        <button
                          key={label}
                          type="button"
                          className="tutor-starter-chip"
                          style={{ animationDelay: `${index * 0.14}s` }}
                          disabled={!isConnected || historyLoading}
                          onClick={() => {
                            void sendMessage(label);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
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
          </div>

          <div className="tutor-composer">
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
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Chat;
