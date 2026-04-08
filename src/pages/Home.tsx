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
    useIonToast,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
    createManualMovement,
    createVoiceJob,
    isFeriaApiConfigured,
    uploadAudioToPresignedUrl,
} from '../api/feriaApi';
import { useAuth } from '../auth/AuthContext';
import { getUserDisplayLabel } from '../auth/userDisplay';
import { FeriaAppShell } from '../components/FeriaAppShell';
import KeyboardClassicIcon from '../components/icons/KeyboardClassicIcon';
import { setPendingVoiceJobId } from '../voice/voiceJobStorage';
import './Home.css';

type MovementKind = 'ingreso' | 'gasto';

type VoicePhase = 'idle' | 'recording' | 'uploading' | 'error';

function pickRecorderMime(): { mime: string; label: string } {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
      return { mime: m, label: m };
    }
  }
  return { mime: '', label: 'default' };
}

/** Quick labels for expense concept (modal chips). */
const GASTO_CONCEPT_CHIPS = ['Comida', 'Transporte', 'Servicios', 'Ocio', 'Otros'] as const;

const Home: React.FC = () => {
  const history = useHistory();
  const { user, signOutUser } = useAuth();
  const [presentToast] = useIonToast();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = getUserDisplayLabel(user);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [kind, setKind] = useState<MovementKind>('gasto');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [savingKeyboard, setSavingKeyboard] = useState(false);

  const [voicePhase, setVoicePhase] = useState<VoicePhase>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingRef = useRef(false);

  const apiReady = isFeriaApiConfigured();

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  const startRecording = useCallback(async () => {
    if (!apiReady) return;
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const { mime } = pickRecorderMime();
      const rec = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.start(200);
      recordingRef.current = true;
      setVoicePhase('recording');
    } catch {
      setVoiceError('No se pudo acceder al micrófono.');
      setVoicePhase('error');
      cleanupStream();
    }
  }, [apiReady, cleanupStream]);

  const stopRecordingAndUpload = useCallback(async () => {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state === 'inactive') {
      recordingRef.current = false;
      setVoicePhase('idle');
      cleanupStream();
      return;
    }

    recordingRef.current = false;

    await new Promise<void>((resolve, reject) => {
      rec.onstop = () => resolve();
      rec.onerror = () => reject(new Error('Recorder error'));
      try {
        rec.stop();
      } catch {
        resolve();
      }
    });

    cleanupStream();
    mediaRecorderRef.current = null;

    const recordedContentType = rec.mimeType || pickRecorderMime().mime || 'audio/webm';
    const blob = new Blob(chunksRef.current, {
      type: recordedContentType,
    });
    chunksRef.current = [];

    if (blob.size < 100) {
      setVoicePhase('idle');
      void presentToast({
        message: 'Grabación demasiado corta.',
        duration: 2000,
        color: 'medium',
      });
      return;
    }

    try {
      setVoicePhase('uploading');
      const job = await createVoiceJob(recordedContentType);
      const ct = job.contentType || recordedContentType;
      await uploadAudioToPresignedUrl(job.uploadUrl, blob, ct);
      setPendingVoiceJobId(job.jobId);
      void presentToast({
        message: 'Audio recibido. Procesando en segundo plano.',
        duration: 2000,
        color: 'success',
      });
      setVoicePhase('idle');
      history.push('/movimientos');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al procesar la nota';
      setVoiceError(msg);
      void presentToast({
        message: msg,
        duration: 4000,
        color: 'danger',
      });
      setVoicePhase('idle');
    }
  }, [cleanupStream, history, presentToast]);

  const handleOrbPointerDown = () => {
    if (!apiReady) return;
    void startRecording();
  };

  const handleOrbPointerUp = () => {
    if (recordingRef.current) {
      void stopRecordingAndUpload();
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setKind('gasto');
  };

  const handleSaveKeyboard = async () => {
    const normalizedAmount = Number(amount.trim().replace(',', '.'));
    const normalizedConcept = note.trim();

    if (!apiReady) {
      void presentToast({
        message: 'Configura VITE_FERIA_API_URL para guardar movimientos.',
        duration: 2500,
        color: 'warning',
      });
      return;
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      void presentToast({
        message: 'Ingresa un monto valido mayor a 0.',
        duration: 2500,
        color: 'warning',
      });
      return;
    }

    if (!normalizedConcept) {
      void presentToast({
        message: 'Escribe un concepto para guardar el movimiento.',
        duration: 2500,
        color: 'warning',
      });
      return;
    }

    setSavingKeyboard(true);
    try {
      await createManualMovement({
        kind,
        amount: normalizedAmount,
        concept: normalizedConcept,
      });
      setKeyboardOpen(false);
      resetForm();
      void presentToast({
        message: 'Movimiento guardado.',
        duration: 2000,
        color: 'success',
      });
      history.push('/movimientos');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo guardar el movimiento';
      void presentToast({
        message: msg,
        duration: 3500,
        color: 'danger',
      });
    } finally {
      setSavingKeyboard(false);
    }
  };

  const appendConceptChip = (label: string) => {
    setNote((prev) => {
      const t = prev.trim();
      if (!t) {
        return label;
      }
      if (t.toLowerCase().includes(label.toLowerCase())) {
        return t;
      }
      return `${t}, ${label}`;
    });
  };

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

  const listening = voicePhase === 'recording';
  const busy = voicePhase === 'uploading';

  return (
    <IonPage className="home-page">
      <FeriaAppShell
        contentClassName="home-content"
        headerEnd={
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
        }
      >
        <div className="home-layout">
          <p className="feria-text-label-caps">Hola, {displayName}</p>
          <h1 className="home-hero-line">Registra un ingreso o un gasto</h1>

          <div
            className={`siri-orb-wrap ${listening ? 'siri-orb-wrap--active' : ''}`}
            onPointerDown={handleOrbPointerDown}
            onPointerUp={handleOrbPointerUp}
            onPointerCancel={handleOrbPointerUp}
            onPointerLeave={(e) => {
              if (e.buttons === 0 && recordingRef.current) handleOrbPointerUp();
            }}
            role="button"
            tabIndex={0}
            aria-label={
              apiReady
                ? busy
                  ? 'Subiendo audio…'
                  : 'Mantén pulsado para grabar una nota de voz'
                : 'Configura VITE_FERIA_API_URL para grabar notas'
            }
            style={{ opacity: busy ? 0.7 : 1, pointerEvents: busy || !apiReady ? 'none' : 'auto' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!listening && apiReady && !busy) void startRecording();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOrbPointerUp();
            }}
          >
            <div className="siri-orb-glow" aria-hidden />
            <div className="siri-orb-ring" aria-hidden />
            <div className="siri-orb-core">
              <span className={`home-orb-hint ${listening ? 'home-orb-hint--active' : ''}`}>
                {busy
                  ? 'Subiendo…'
                  : listening
                    ? 'Grabando…'
                    : 'Mantén pulsado'}
              </span>
            </div>
          </div>

          {!apiReady && (
            <IonText color="medium">
              <p className="home-voice-unsupported">
                Añade <code>VITE_FERIA_API_URL</code> en <code>.env</code> para grabar y procesar notas de voz.
              </p>
            </IonText>
          )}

          {voiceError && voicePhase === 'error' && (
            <IonText color="danger">
              <p className="home-voice-unsupported">{voiceError}</p>
            </IonText>
          )}
        </div>
      </FeriaAppShell>

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

          {kind === 'gasto' && (
            <div className="home-modal-chips" role="group" aria-label="Conceptos rápidos">
              {GASTO_CONCEPT_CHIPS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="home-modal-chip"
                  onClick={() => appendConceptChip(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <IonButton
            expand="block"
            className="feria-modal-primary"
            onClick={() => {
              void handleSaveKeyboard();
            }}
            disabled={savingKeyboard}
          >
            {savingKeyboard ? <IonSpinner name="crescent" /> : 'Guardar'}
          </IonButton>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Home;
