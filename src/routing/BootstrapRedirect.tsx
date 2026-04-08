import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isOnboardingComplete } from '../onboarding/onboardingStorage';

/**
 * Resolves `/` to login first, then onboarding, then home.
 */
const BootstrapRedirect: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <IonPage className="bootstrap-redirect-page">
        <IonContent className="ion-padding ion-text-center bootstrap-redirect-content">
          <IonSpinner name="crescent" />
        </IonContent>
      </IonPage>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!isOnboardingComplete()) {
    return <Redirect to="/onboarding" />;
  }

  return <Redirect to="/home" />;
};

export default BootstrapRedirect;
