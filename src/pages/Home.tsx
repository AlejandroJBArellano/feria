import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonModal,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import KeyboardClassicIcon from '../components/icons/KeyboardClassicIcon';
import './Home.css';

type MovementKind = 'ingreso' | 'gasto';

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: AppSpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface AppSpeechRecognitionResultEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

function createSpeechRecognition(): SpeechRecognitionInstance | null {
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.continuous = false;
  r.interimResults = true;
  r.lang = 'es-MX';
  return r;
}

const Home: React.FC = () => {
  const history = useHistory();
  const { user, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = user?.name ?? user?.email ?? user?.username ?? 'Usuario autenticado';
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceInterim, setVoiceInterim] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [kind, setKind] = useState<MovementKind>('gasto');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    const r = createSpeechRecognition();
    recognitionRef.current = r;
    setVoiceSupported(!!r);
    if (!r) return;

    r.onresult = (event: AppSpeechRecognitionResultEvent) => {
      let interim = '';
      let finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        const piece = res[0]?.transcript ?? '';
        if (res.isFinal) finalText += piece;
        else interim += piece;
      }
      if (interim) setVoiceInterim(interim);
      if (finalText) {
        setVoiceTranscript((prev) => (prev ? `${prev.trim()} ${finalText.trim()}` : finalText.trim()));
        setVoiceInterim('');
      }
    };

    r.onerror = () => {
      setListening(false);
      listeningRef.current = false;
    };

    r.onend = () => {
      if (listeningRef.current) {
        try {
          r.start();
        } catch {
          setListening(false);
          listeningRef.current = false;
        }
      } else {
        setListening(false);
      }
    };

    return () => {
      listeningRef.current = false;
      try {
        r.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    const r = recognitionRef.current;
    if (r) {
      try {
        r.stop();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    setVoiceInterim('');
    listeningRef.current = true;
    setListening(true);
    try {
      r.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
    }
  }, []);

  const handleOrbPointerDown = () => {
    if (!voiceSupported) return;
    startListening();
  };

  const handleOrbPointerUp = () => {
    stopListening();
  };

  const handleOrbPointerLeave = () => {
    if (listeningRef.current) stopListening();
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setKind('gasto');
  };

  const handleSaveKeyboard = () => {
    // Wire to persistence / router when backend exists
    setKeyboardOpen(false);
    resetForm();
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutUser();
      // Hosted UI global sign-out may navigate away entirely; when staying in SPA, sync URL with auth.
      history.replace('/login');
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <IonPage className="home-page">
      <IonContent fullscreen className="home-content">
        <div className="home-layout">
          <p className="feria-text-label-caps">Hola, {displayName}</p>
          <p className="feria-text-muted home-intro">Registra un ingreso o un gasto</p>

          <div
            className={`siri-orb-wrap ${listening ? 'siri-orb-wrap--active' : ''}`}
            onPointerDown={handleOrbPointerDown}
            onPointerUp={handleOrbPointerUp}
            onPointerCancel={handleOrbPointerUp}
            onPointerLeave={handleOrbPointerLeave}
            role="button"
            tabIndex={0}
            aria-label={
              voiceSupported
                ? 'Mantén pulsado para dictar con la voz'
                : 'Dictado por voz no disponible en este dispositivo'
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!listening) startListening();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.key === ' ') stopListening();
            }}
          >
            <div className="siri-orb-glow" aria-hidden />
            <div className="siri-orb-ring" aria-hidden />
            <div className="siri-orb-core">
              <span className={`feria-text-hint ${listening ? 'feria-text-hint--active' : ''}`}>
                {listening ? 'Escuchando…' : 'Mantén pulsado'}
              </span>
            </div>
          </div>

          {!voiceSupported && (
            <IonText color="medium">
              <p className="home-voice-unsupported">El dictado por voz no está disponible aquí.</p>
            </IonText>
          )}

          {(voiceTranscript || voiceInterim) && (
            <div className="home-transcript">
              <p className="feria-text-label-caps">Reconocido</p>
              <p className="home-transcript-text">
                {voiceTranscript}
                {voiceInterim ? <span className="home-transcript-interim">{voiceInterim}</span> : null}
              </p>
            </div>
          )}
        </div>
      </IonContent>

      <div className="feria-fixed-corner-tl">
        <IonButton
          className="feria-icon-btn-quiet"
          fill="solid"
          shape="round"
          aria-label="Cerrar sesión"
          disabled={signingOut}
          onClick={() => {
            void handleSignOut();
          }}
        >
          {signingOut ? <IonSpinner name="crescent" /> : <IonIcon icon={logOutOutline} aria-hidden />}
        </IonButton>
      </div>

      <div className="feria-fixed-corner-br">
        <IonButton
          className="feria-icon-btn-quiet"
          fill="solid"
          shape="round"
          aria-label="Escribir con teclado"
          onClick={() => setKeyboardOpen(true)}
        >
          <KeyboardClassicIcon />
        </IonButton>
      </div>

      <IonModal
        isOpen={keyboardOpen}
        onDidDismiss={() => setKeyboardOpen(false)}
        className="feria-modal"
        breakpoints={[0, 1]}
        initialBreakpoint={1}
        handle
        backdropDismiss
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Nuevo movimiento</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setKeyboardOpen(false)}>
              Cerrar
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding feria-modal-body">
          <IonText color="medium">
            <p className="home-modal-intro">Tipo de movimiento</p>
          </IonText>
          <IonSegment
            value={kind}
            onIonChange={(e) => {
              const v = e.detail.value as MovementKind | undefined;
              if (v === 'ingreso' || v === 'gasto') setKind(v);
            }}
          >
            <IonSegmentButton value="gasto">
              <IonLabel>Gasto</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="ingreso">
              <IonLabel>Ingreso</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <IonItem className="feria-modal-field" lines="none">
            <IonInput
              label="Monto"
              labelPlacement="stacked"
              type="number"
              inputmode="decimal"
              placeholder="0.00"
              value={amount}
              onIonInput={(e) => setAmount(String(e.detail.value ?? ''))}
            />
          </IonItem>
          <IonItem className="feria-modal-field" lines="none">
            <IonInput
              label="Concepto"
              labelPlacement="stacked"
              placeholder="Ej. supermercado, nómina…"
              value={note}
              onIonInput={(e) => setNote(String(e.detail.value ?? ''))}
            />
          </IonItem>

          <IonButton expand="block" className="feria-modal-primary" onClick={handleSaveKeyboard}>
            Guardar
          </IonButton>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Home;
