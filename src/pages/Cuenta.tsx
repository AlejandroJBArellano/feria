import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FeriaAppShell } from '../components/FeriaAppShell';
import ThemeToggle from '../components/ThemeToggle';
import './Cuenta.css';

function displayOrDash(value: string | undefined): string {
  return value && value.trim().length > 0 ? value : '—';
}

const Cuenta: React.FC = () => {
  const history = useHistory();
  const { user, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <IonPage className="cuenta-page">
      <FeriaAppShell contentClassName="cuenta-content">
        <div className="cuenta-body ion-padding">
          <IonText color="medium">
            <p className="cuenta-lead">Datos de sesión y preferencias. Parte de la información es de demostración.</p>
          </IonText>

          <h2 className="cuenta-section-title">Tu cuenta</h2>
          <IonList className="cuenta-list" lines="full">
            <IonItem>
              <IonLabel>
                <p className="cuenta-item__label">Nombre</p>
                <p className="cuenta-item__value">{displayOrDash(user?.name)}</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p className="cuenta-item__label">Correo</p>
                <p className="cuenta-item__value">{displayOrDash(user?.email)}</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p className="cuenta-item__label">Usuario (Cognito)</p>
                <p className="cuenta-item__value cuenta-item__value--mono">{displayOrDash(user?.username)}</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p className="cuenta-item__label">ID de usuario</p>
                <p className="cuenta-item__value cuenta-item__value--mono">{displayOrDash(user?.userId)}</p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <p className="cuenta-item__label">Proveedor de acceso</p>
                <p className="cuenta-item__value">{displayOrDash(user?.provider)}</p>
              </IonLabel>
            </IonItem>
          </IonList>

          <h2 className="cuenta-section-title">Detalles adicionales (demo)</h2>
          <IonList className="cuenta-list" lines="full">
            <IonItem>
              <IonLabel>
                <p className="cuenta-item__label">Teléfono</p>
                <p className="cuenta-item__value">+52 ••• ••• •••• (demo)</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p className="cuenta-item__label">Ciudad</p>
                <p className="cuenta-item__value">Por definir (demo)</p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <p className="cuenta-item__label">Zona horaria</p>
                <p className="cuenta-item__value">America/Mexico_City (demo)</p>
              </IonLabel>
            </IonItem>
          </IonList>

          <h2 className="cuenta-section-title">Preferencias</h2>
          <IonList className="cuenta-list cuenta-list--prefs" lines="none">
            <IonItem lines="none">
              <IonLabel>
                <p className="cuenta-item__label">Moneda</p>
                <p className="cuenta-item__value">MXN (demo)</p>
              </IonLabel>
              <IonNote slot="end">Próximamente editable</IonNote>
            </IonItem>
            <ThemeToggle variant="field" />
          </IonList>

          <IonButton
            expand="block"
            className="cuenta-signout"
            fill="outline"
            color="medium"
            disabled={signingOut}
            onClick={() => {
              void handleSignOut();
            }}
          >
            {signingOut ? (
              <IonSpinner name="crescent" />
            ) : (
              <>
                <IonIcon slot="start" icon={logOutOutline} aria-hidden />
                Cerrar sesión
              </>
            )}
          </IonButton>
        </div>
      </FeriaAppShell>
    </IonPage>
  );
};

export default Cuenta;
