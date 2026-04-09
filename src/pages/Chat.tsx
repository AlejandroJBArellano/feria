import {
  IonButton,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { addOutline, logOutOutline, paperPlaneOutline } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  isFeriaApiConfigured,
  listChatMessages,
  sendChatMessage,
} from '../api/feriaApi';
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
  const [conversationId, setConversationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CONVERSATION_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const conversationIdRef = useRef<string | null>(conversationId);

  conversationIdRef.current = conversationId;

  const apiReady = useMemo(() => isFeriaApiConfigured(), []);

  const connectionStatus = useMemo(() => {
    if (!apiReady) {
      return 'Configura VITE_FERIA_API_URL para usar el tutor.';
    }
    if (historyLoading) {
      return 'Cargando historial...';
    }
    return 'Listo';
  }, [apiReady, historyLoading]);

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

  const sendMessage = useCallback(
    async (promptRaw: string) => {
      const prompt = promptRaw.trim();
      if (!prompt || isStreaming || !apiReady) {
        return;
      }

      const userMsgId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-user`;
      const assistantId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-asst`;

      setIsStreaming(true);
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', content: prompt },
        { id: assistantId, role: 'assistant', content: '', pending: true },
      ]);
      setDraft('');

      try {
        const { conversationId: cid, reply } = await sendChatMessage(prompt, {
          conversationId: conversationIdRef.current ?? undefined,
        });
        setConversationId(cid);
        try {
          localStorage.setItem(CONVERSATION_STORAGE_KEY, cid);
        } catch {
          /* ignore */
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: reply, pending: false }
              : m
          )
        );
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'No se pudo obtener respuesta del tutor.';
        setMessages((prev) => {
          const next = prev.filter((m) => m.id !== assistantId);
          return [
            ...next,
            {
              id: `${assistantId}-err`,
              role: 'system',
              content: msg,
            },
          ];
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [apiReady, isStreaming]
  );

  const sendPrompt = useCallback(() => {
    void sendMessage(draft);
  }, [draft, sendMessage]);

  return (
    <IonPage className="chat-page">
      <FeriaAppShell
        contentClassName="chat-content chat-content--tutor"
        contentFullscreen={false}
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
                  <p
                    className={`chat-status ${apiReady ? 'chat-status--ok' : 'chat-status--warn'}`}
                  >
                    {connectionStatus}
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
                          disabled={!apiReady || historyLoading || isStreaming}
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
                  messages.map((message) => {
                    const renderMarkdown = (text: string) => {
                      if (!text) return null;

                      const lines = text.split('\n');
                      const elements = [];
                      let inTable = false;
                      let tableRows = [];

                      const processText = (str: string) => {
                        // Very basic bold and italic replacement
                        let parsed = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
                        // Render emojis wrapped in some simple tags if needed, but strings are fine
                        return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
                      };

                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];

                        if (line.startsWith('|')) {
                          inTable = true;
                          if (!line.includes('---')) {
                            tableRows.push(line);
                          }
                          continue;
                        } else if (inTable) {
                          // End of table
                          elements.push(
                            <table className="chat-table" key={`table-${i}`}>
                              <tbody>
                                {tableRows.map((row, rIdx) => (
                                  <tr key={`tr-${rIdx}`}>
                                    {row.split('|').filter(c => c.trim()).map((cell, cIdx) => (
                                      rIdx === 0 ? <th key={`th-${cIdx}`}>{processText(cell.trim())}</th> : <td key={`td-${cIdx}`}>{processText(cell.trim())}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                          inTable = false;
                          tableRows = [];
                        }

                        if (line.startsWith('## ')) {
                          elements.push(<h3 key={`h3-${i}`} className="chat-h3">{processText(line.replace('## ', ''))}</h3>);
                        } else if (line.startsWith('# ')) {
                          elements.push(<h2 key={`h2-${i}`} className="chat-h2">{processText(line.replace('# ', ''))}</h2>);
                        } else if (line.startsWith('- ')) {
                          elements.push(<li key={`li-${i}`} className="chat-li">{processText(line.replace('- ', ''))}</li>);
                        } else if (line.trim().length > 0) {
                          elements.push(<p key={`p-${i}`}>{processText(line)}</p>);
                        }
                      }

                      // Catch trailing table
                      if (inTable && tableRows.length > 0) {
                        elements.push(
                          <table className="chat-table" key={`table-end`}>
                            <tbody>
                              {tableRows.map((row, rIdx) => (
                                <tr key={`tr-${rIdx}`}>
                                  {row.split('|').filter(c => c.trim()).map((cell, cIdx) => (
                                    rIdx === 0 ? <th key={`th-${cIdx}`}>{processText(cell.trim())}</th> : <td key={`td-${cIdx}`}>{processText(cell.trim())}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      }

                      return elements;
                    };

                    return (
                      <article
                        key={message.id}
                        className={`chat-bubble chat-bubble--${message.role}`}
                      >
                        {message.pending ? <p>Generando...</p> : renderMarkdown(message.content)}
                      </article>
                    );
                  })
                )}

                {isStreaming ? (
                  <div className="chat-streaming">Generando respuesta...</div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>

          <div className="tutor-composer">
            <div className="tutor-composer-inner">
              <IonTextarea
                className="tutor-textarea-playful"
                autoGrow
                aria-label="Mensaje para el tutor"
                value={draft}
                placeholder="Escribe tu mensaje…"
                onIonInput={(event) => setDraft(String(event.detail.value ?? ''))}
              />
              <IonButton
                className="chat-send-btn feria-btn-playful"
                shape="round"
                onClick={() => {
                  void sendPrompt();
                }}
                disabled={!apiReady || isStreaming || draft.trim().length === 0 || historyLoading}
              >
                <IonIcon icon={paperPlaneOutline} slot="start" />
                Enviar
              </IonButton>
            </div>
          </div>
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Chat;
