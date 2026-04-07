import { IonButton, IonContent, IonPage, IonSpinner } from '@ionic/react';
import { Redirect, useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
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

  if (isOnboardingComplete()) {
    return <Redirect to={isAuthenticated ? '/home' : '/login'} />;
  }

  const handleContinue = () => {
    markOnboardingComplete();
    if (isAuthenticated) {
      history.replace('/home');
    } else {
      history.replace('/login');
    }
  };

  return (
    <IonPage className="onboarding-page">
      <IonContent fullscreen className="onboarding-content">
        <div className="onboarding-inner">
          <p className="onboarding-eyebrow">Bienvenida</p>
          <h1 className="onboarding-title">
            Conoce a <span>FerIA</span>
          </h1>
          <p className="onboarding-copy">
            Tu asistente para ordenar ingresos y gastos. Pronto personalizaremos la experiencia contigo; por ahora
            solo confirma para continuar.
          </p>
          <IonButton expand="block" className="onboarding-primary" onClick={handleContinue}>
            Continuar
          </IonButton>
          <p className="onboarding-hint">En versiones futuras aquí recopilaremos tus preferencias.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;
