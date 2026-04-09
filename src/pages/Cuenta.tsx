import {
  IonButton,
  IonIcon,
  IonNote,
  IonPage,
  IonSpinner,
  IonText
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
            <p className="cuenta-lead">Acá configuras tu perfil y cómo se ve la app. (Algunos datos son de prueba rey).</p>
          </IonText>

          <h2 className="cuenta-section-title">Tu perfil</h2>
          <div className="cuenta-grid">
            <div className="cuenta-card">
              <p className="cuenta-card__label">Nombre</p>
              <p className="cuenta-card__value">{displayOrDash(user?.name)}</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">Correo</p>
              <p className="cuenta-card__value">{displayOrDash(user?.email)}</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">Usuario (Cognito)</p>
              <p className="cuenta-card__value cuenta-card__value--mono">{displayOrDash(user?.username)}</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">ID de usuario</p>
              <p className="cuenta-card__value cuenta-card__value--mono">{displayOrDash(user?.userId)}</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">Proveedor</p>
              <p className="cuenta-card__value">{displayOrDash(user?.provider)}</p>
            </div>
          </div>

          <h2 className="cuenta-section-title">Tus datos (demo)</h2>
          <div className="cuenta-grid">
            <div className="cuenta-card">
              <p className="cuenta-card__label">Teléfono</p>
              <p className="cuenta-card__value">+52 ••• ••• •••• (demo)</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">Ciudad</p>
              <p className="cuenta-card__value">Por definir (demo)</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">Zona horaria</p>
              <p className="cuenta-card__value">America/Mexico_City (demo)</p>
            </div>
          </div>

          <h2 className="cuenta-section-title">Ajustes</h2>
          <div className="cuenta-grid">
            <div className="cuenta-card">
              <p className="cuenta-card__label">Moneda</p>
              <p className="cuenta-card__value">MXN (demo)</p>
              <IonNote color="medium" style={{ fontSize: '0.7em', marginTop: 4 }}>Próximamente editable</IonNote>
            </div>
            <div className="cuenta-card cuenta-card--theme">
              <ThemeToggle />
            </div>
          </div>

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
