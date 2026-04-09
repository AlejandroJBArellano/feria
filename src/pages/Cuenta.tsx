import {
  IonAvatar,
  IonButton,
  IonIcon,
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

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
            {user?.picture && (
              <IonAvatar style={{ width: '64px', height: '64px' }}>
                <img alt="User profile" src={user.picture} referrerPolicy="no-referrer" />
              </IonAvatar>
            )}
            <h2 className="cuenta-section-title" style={{ margin: 0 }}>Tu perfil</h2>
          </div>
          <div className="cuenta-grid">
            <div className="cuenta-card">
              <p className="cuenta-card__label">Nombre</p>
              <p className="cuenta-card__value">{displayOrDash(user?.name)}</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">Correo</p>
              <p className="cuenta-card__value">{displayOrDash(user?.email)}</p>
            </div>
          </div>

          <h2 className="cuenta-section-title">Ajustes</h2>
          <div className="cuenta-grid">
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
