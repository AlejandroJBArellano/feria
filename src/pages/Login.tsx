import {
    IonButton,
    IonContent,
    IonHeader,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isCognitoConfigured } from '../auth/configureAmplify';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  if (isAuthenticated) {
    return <Redirect to="/home" />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar sesion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <h2>Accede con Cognito</h2>
        </IonText>
        <IonText color="medium">
          <p>
            Esta pantalla redirige al Hosted UI de Amazon Cognito para autenticar al usuario de forma
            segura con OAuth2 + PKCE.
          </p>
        </IonText>

        {!isCognitoConfigured && (
          <IonText color="danger">
            <p>Faltan variables VITE_COGNITO_* en tu entorno.</p>
          </IonText>
        )}

        <IonButton
          expand="block"
          disabled={!isCognitoConfigured || isLoading}
          onClick={() => {
            void signIn('Google');
          }}
        >
          Continuar con Google
        </IonButton>

        <IonButton
          expand="block"
          fill="clear"
          disabled={!isCognitoConfigured || isLoading}
          onClick={() => {
            void signIn();
          }}
        >
          Usar portal de Cognito
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;