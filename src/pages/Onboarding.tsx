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

          <div className="onboarding-theme-footer">
            <ThemeToggle variant="inline" />
          </div>
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Onboarding;
