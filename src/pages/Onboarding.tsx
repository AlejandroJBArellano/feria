import { IonButton, IonContent, IonPage, IonSpinner } from '@ionic/react';
import { Redirect, useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FeriaAppShell } from '../components/FeriaAppShell';
import ThemeToggle from '../components/ThemeToggle';
import { isOnboardingComplete, markOnboardingComplete } from '../onboarding/onboardingStorage';
import './Onboarding.css';

const Onboarding: React.FC = () => {
  const history = useHistory();
  const { isLoading, isAuthenticated } = useAuth();

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

  if (isOnboardingComplete()) {
    return <Redirect to="/home" />;
  }

  const handleContinue = () => {
    markOnboardingComplete();
    history.replace('/home');
  };

  return (
    <IonPage className="onboarding-page">
      <div className="onboarding-ai-bg" aria-hidden />
      <FeriaAppShell contentClassName="onboarding-content">
        <div className="onboarding-ai-layout">
          <div className="onboarding-ai-hero">
            <div className="onboarding-ai-orb" aria-hidden>
              <span className="onboarding-ai-orb__core" />
              <span className="onboarding-ai-orb__ring" />
            </div>
            <p className="onboarding-ai-eyebrow">Asistente financiero</p>
            <h1 className="onboarding-ai-title">
              Habla con <span className="onboarding-ai-title__brand">FerIA</span>
            </h1>
            <p className="onboarding-ai-lead">
              Registra ingresos y gastos con voz o teclado. Un solo estilo, claro u oscuro, pensado para sentirse
              ligero y moderno.
            </p>
          </div>

          <div className="onboarding-ai-glass">
            <ul className="onboarding-ai-pills" aria-label="Capacidades">
              <li className="onboarding-ai-pill">
                <span className="onboarding-ai-pill__dot" aria-hidden />
                Dictado natural
              </li>
              <li className="onboarding-ai-pill">
                <span className="onboarding-ai-pill__dot" aria-hidden />
                Movimientos rápidos
              </li>
              <li className="onboarding-ai-pill">
                <span className="onboarding-ai-pill__dot" aria-hidden />
                Privacidad primero
              </li>
            </ul>
            <IonButton expand="block" className="onboarding-ai-cta" onClick={handleContinue}>
              Empezar
            </IonButton>
            <p className="onboarding-ai-footnote">
              Tras iniciar sesión podrás afinar tema y datos en <strong>Cuenta</strong>.
            </p>
          </div>

          <div className="onboarding-theme-footer">
            <ThemeToggle variant="inline" />
          </div>
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Onboarding;
