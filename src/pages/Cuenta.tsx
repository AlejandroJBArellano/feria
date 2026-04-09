import {
  IonAvatar,
  IonButton,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FeriaAppShell } from '../components/FeriaAppShell';
import ThemeToggle from '../components/ThemeToggle';
import { getUserProfile, UserProfileResponse } from '../api/feriaApi';
import './Cuenta.css';

function displayOrDash(value: string | undefined | null): string {
  return value && value.trim().length > 0 ? value : '—';
}

const Cuenta: React.FC = () => {
  const history = useHistory();
  const { user, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [dbProfile, setDbProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (user?.userId) {
      getUserProfile()
        .then((p) => setDbProfile(p))
        .catch((e) => console.error('[Cuenta] Error fetching db profile:', e));
    }
  }, [user?.userId]);

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

  const displayName = dbProfile?.name || user?.name;
  const displayEmail = dbProfile?.email || user?.email;
  const displayPicture = dbProfile?.picture || user?.picture;

  return (
    <IonPage className="cuenta-page">
      <FeriaAppShell contentClassName="cuenta-content">
        <div className="cuenta-body ion-padding">
          <IonText color="medium">
            <p className="cuenta-lead">Acá configuras tu perfil y cómo se ve la app. (Algunos datos son de prueba rey).</p>
          </IonText>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
            {displayPicture && (
              <IonAvatar style={{ width: '4rem', height: '4rem' }}>
                <img alt="User profile" src={displayPicture} referrerPolicy="no-referrer" />
              </IonAvatar>
            )}
            <h2 className="cuenta-section-title" style={{ margin: 0 }}>Tu perfil</h2>
          </div>
          <div className="cuenta-grid">
            <div className="cuenta-card">
              <p className="cuenta-card__label">Nombre</p>
              <p className="cuenta-card__value">{displayOrDash(displayName)}</p>
            </div>
            <div className="cuenta-card">
              <p className="cuenta-card__label">Correo</p>
              <p className="cuenta-card__value">{displayOrDash(displayEmail)}</p>
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
