import {
  IonButton,
  IonContent,
  IonPage,
  IonSpinner,
  IonText,
  useIonToast,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import {
  completeOnboarding,
  createVoiceJob,
  ensureUserProfileSynced,
  isFeriaApiConfigured,
  pollVoiceJobUntilDone,
  uploadAudioToPresignedUrl,
} from '../api/feriaApi';
import { useAuth } from '../auth/AuthContext';
import { FeriaAppShell } from '../components/FeriaAppShell';
import ThemeToggle from '../components/ThemeToggle';
import { ONBOARDING_QUESTIONS, ONBOARDING_QUESTION_COUNT } from '../onboarding/onboardingQuestions';
import { isOnboardingComplete, markOnboardingComplete } from '../onboarding/onboardingStorage';
import './Home.css';
import './Onboarding.css';

type VoicePhase = 'idle' | 'recording' | 'uploading' | 'processing' | 'error';

function pickRecorderMime(): { mime: string } {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
      return { mime: m };
    }
  }
  return { mime: '' };
}

const Onboarding: React.FC = () => {
  const history = useHistory();
  const { isLoading, isAuthenticated } = useAuth();
  const [presentToast] = useIonToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [profileSyncError, setProfileSyncError] = useState<string | null>(null);
  const [profileSyncAttempt, setProfileSyncAttempt] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingRef = useRef(false);

  const apiReady = isFeriaApiConfigured();
  const q = ONBOARDING_QUESTIONS[stepIndex];

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileReady(false);
      setProfileSyncError(null);
      return;
    }
    if (!apiReady) {
      setProfileReady(true);
      setProfileSyncError(null);
      return;
    }
    let cancelled = false;
    setProfileSyncError(null);
    setProfileReady(false);
    void (async () => {
      try {
        await ensureUserProfileSynced();
        if (!cancelled) {
          setProfileReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setProfileSyncError(
            e instanceof Error ? e.message : 'No se pudo sincronizar el perfil'
          );
          setProfileReady(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, apiReady, profileSyncAttempt]);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    if (!apiReady || !profileReady) return;
    setVoiceError(null);
    setLastSummary(null);
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
  }, [apiReady, profileReady, cleanupStream]);

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
    const blob = new Blob(chunksRef.current, { type: recordedContentType });
    chunksRef.current = [];

    if (blob.size < 120) {
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
      const job = await createVoiceJob({
        contentType: recordedContentType,
        purpose: 'onboarding',
        onboardingStep: stepIndex,
      });
      const ct = job.contentType || recordedContentType;
      await uploadAudioToPresignedUrl(job.uploadUrl, blob, ct);
      setVoicePhase('processing');
      const done = await pollVoiceJobUntilDone(job.jobId, {
        intervalMs: 750,
        maxAttempts: 120,
      });
      if (done.status === 'failed') {
        throw new Error(done.error || 'No se pudo procesar el audio');
      }
      const summary =
        typeof done.onboardingSummary === 'string' ? done.onboardingSummary.trim() : '';
      setLastSummary(summary || '(Sin resumen)');
      setVoicePhase('idle');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al procesar la nota de voz';
      setVoiceError(msg);
      void presentToast({ message: msg, duration: 4000, color: 'danger' });
      setVoicePhase('idle');
    }
  }, [cleanupStream, presentToast, stepIndex]);

  const handleOrbPointerDown = () => {
    if (!apiReady || !profileReady || voicePhase !== 'idle' || finishing) return;
    void startRecording();
  };

  const handleOrbPointerUp = () => {
    if (recordingRef.current) {
      void stopRecordingAndUpload();
    }
  };

  const goNext = () => {
    setLastSummary(null);
    setVoiceError(null);
    if (stepIndex < ONBOARDING_QUESTION_COUNT - 1) {
      setStepIndex((s) => s + 1);
    }
  };

  const handleFinish = async () => {
    if (!apiReady || finishing) return;
    setFinishing(true);
    try {
      await completeOnboarding();
      markOnboardingComplete();
      void presentToast({
        message: 'Perfil listo. Bienvenido a Feria.',
        duration: 2500,
        color: 'success',
      });
      history.replace('/home');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo guardar tu perfil';
      void presentToast({ message: msg, duration: 4500, color: 'danger' });
    } finally {
      setFinishing(false);
    }
  };

  if (isLoading) {
    return (
      <IonPage className="onboarding-page">
        <IonContent fullscreen className="onboarding-content ion-padding ion-text-center feria-route-loading">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (apiReady && profileSyncError) {
    return (
      <IonPage className="onboarding-page">
        <IonContent fullscreen className="onboarding-content ion-padding ion-text-center">
          <p className="onboarding-voice-hint" role="alert">
            {profileSyncError}
          </p>
          <IonButton
            onClick={() => {
              setProfileSyncError(null);
              setProfileReady(false);
              setProfileSyncAttempt((n) => n + 1);
            }}
          >
            Reintentar
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  if (apiReady && !profileReady) {
    return (
      <IonPage className="onboarding-page">
        <IonContent fullscreen className="onboarding-content ion-padding ion-text-center feria-route-loading">
          <IonSpinner name="crescent" />
          <p className="onboarding-voice-hint">Preparando tu perfil…</p>
        </IonContent>
      </IonPage>
    );
  }

  if (isOnboardingComplete()) {
    return <Redirect to="/home" />;
  }

  const handleContinue = () => {
    markOnboardingComplete();
  }

  const listening = voicePhase === 'recording';
  const busy = voicePhase === 'uploading' || voicePhase === 'processing';
  const showReview = lastSummary != null && voicePhase === 'idle' && !voiceError;
  const isLast = stepIndex === ONBOARDING_QUESTION_COUNT - 1;

  return (
    <IonPage className="onboarding-page">
      <div className="onboarding-ai-bg" aria-hidden />
      <FeriaAppShell contentClassName="onboarding-content">
        <div className="onboarding-ai-layout">
          <div className="onboarding-ai-hero">
            <div className="onboarding-gamified-images" aria-hidden>
              {/* Flotating emojis instead of an abstract orb */}
              <span className="onboarding-emoji" style={{ fontSize: '4rem', transform: 'rotate(-10deg)', display: 'inline-block', margin: '0 10px' }}>🌮</span>
              <span className="onboarding-emoji" style={{ fontSize: '4.5rem', zIndex: 2, position: 'relative' }}>💰</span>
              <span className="onboarding-emoji" style={{ fontSize: '4rem', transform: 'rotate(15deg)', display: 'inline-block', margin: '0 10px' }}>🛵</span>
            </div>
            <p className="onboarding-ai-eyebrow">Tu compa para la lana</p>
            <h1 className="onboarding-ai-title">
              ¡Pásale a <span className="onboarding-ai-title__brand">FerIA</span>!
            </h1>
            <p className="onboarding-ai-lead">
              Lleva el control de tu chamba sin complicaciones. Registra lo que cae y lo que sale con notas de voz o teclado en caliente.
            </p>
          </div>

          <div className="onboarding-ai-glass">
            <ul className="onboarding-ai-pills" aria-label="Beneficios">
              <li className="onboarding-ai-pill">
                <span aria-hidden>🎙️</span>
                Háblale y ella anota
              </li>
              <li className="onboarding-ai-pill">
                <span aria-hidden>🏅</span>
                Gana rachas y medallas
              </li>
              <li className="onboarding-ai-pill">
                <span aria-hidden>📱</span>
                Privado y seguro
              </li>
            </ul>
            <IonButton expand="block" className="onboarding-ai-cta" onClick={handleContinue}>
              ¡A darle!
            </IonButton>
            <p className="onboarding-ai-footnote">
              Más al rato puedes ajustar tu cuenta y tema en tu perfil.
            </p>
          </div>

          {!apiReady && (
            <IonText color="medium">
              <p className="onboarding-voice-hint">Configura VITE_FERIA_API_URL para el perfil por voz.</p>
            </IonText>
          )}

          {apiReady && !showReview && (
            <div className="onboarding-voice-orb-block">
              <button
                type="button"
                className={`siri-orb-wrap onboarding-voice-orb ${listening ? 'siri-orb-wrap--active' : ''}`}
                aria-label={listening ? 'Suelta para enviar' : 'Mantén presionado para hablar'}
                onPointerDown={handleOrbPointerDown}
                onPointerUp={handleOrbPointerUp}
                onPointerLeave={() => {
                  if (recordingRef.current) void stopRecordingAndUpload();
                }}
                disabled={busy || finishing}
              >
                <div className="siri-orb-glow" aria-hidden />
                <div className="siri-orb-ring" aria-hidden />
                <div className="siri-orb-core">
                  <span className={`home-orb-hint ${listening ? 'home-orb-hint--active' : ''}`}>
                    {busy
                      ? voicePhase === 'uploading'
                        ? 'Subiendo…'
                        : 'Procesando…'
                      : listening
                        ? 'Suelta para enviar'
                        : 'Mantén presionado y habla'}
                  </span>
                </div>
              </button>
              {busy && (
                <div className="onboarding-voice-busy">
                  <IonSpinner name="crescent" />
                </div>
              )}
            </div>
          )}

          {voiceError && (
            <p className="home-voice-unsupported" role="alert">
              {voiceError}
            </p>
          )}

          {showReview && (
            <div className="onboarding-voice-review">
              <p className="onboarding-voice-review-label">Resumen de tu respuesta</p>
              <p className="onboarding-voice-review-text">{lastSummary}</p>
              {!isLast ? (
                <IonButton expand="block" className="onboarding-ai-cta" onClick={goNext}>
                  Siguiente
                </IonButton>
              ) : (
                <IonButton
                  expand="block"
                  className="onboarding-ai-cta"
                  onClick={() => void handleFinish()}
                  disabled={finishing}
                >
                  {finishing ? 'Guardando perfil…' : 'Finalizar y entrar a Feria'}
                </IonButton>
              )}
            </div>
          )}

          <div className="onboarding-theme-footer">
            <ThemeToggle variant="inline" />
          </div>
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Onboarding;
