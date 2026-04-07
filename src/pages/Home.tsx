import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { useAuth } from '../auth/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { user, signOutUser } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Feria</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <IonText>
          <h2>Sesion autenticada</h2>
        </IonText>
        <IonText color="medium">
          <p>Usuario: {user?.email ?? user?.username ?? 'Sin datos de perfil'}</p>
          <p>ID: {user?.userId ?? 'No disponible'}</p>
        </IonText>

        <IonButton
          expand="block"
          fill="outline"
          color="danger"
          onClick={() => {
            void signOutUser();
          }}
        >
          Cerrar sesion
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
