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
  const displayName = user?.name ?? user?.email ?? user?.username ?? 'Usuario autenticado';

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
          <p>Nombre: {displayName}</p>
          <p>Correo: {user?.email ?? 'No disponible'}</p>
          <p>Proveedor: {user?.provider ?? 'No disponible'}</p>
          <p>Usuario: {user?.username ?? 'No disponible'}</p>
          {user?.userId && <p>ID interno: {user.userId}</p>}
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
