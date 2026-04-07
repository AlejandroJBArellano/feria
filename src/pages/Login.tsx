import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonPage,
  IonText,
} from '@ionic/react';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // UI only: no backend yet — navigate so you can explore the app
    history.push('/home');
  };

  return (
    <IonPage className="login-page">
      <IonContent fullscreen className="login-content">
        <main className="login-layout">
          <section className="login-brand">
            <h1 className="login-brand__title">FactorSocial</h1>
            <p className="login-brand__tagline">Tu confianza digital, tu libertad financiera.</p>
          </section>

          <section className="login-card">
            <h2 className="login-card__heading">Iniciar sesión</h2>
            <p className="login-card__sub">Usa tu correo y contraseña</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <IonItem className="login-field" lines="none">
                <IonInput
                  type="email"
                  inputMode="email"
                  autocomplete="email"
                  label="Correo electrónico"
                  labelPlacement="stacked"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onIonInput={(ev) => setEmail(String(ev.detail.value ?? ''))}
                />
              </IonItem>

              <IonItem className="login-field" lines="none">
                <IonInput
                  type="password"
                  autocomplete="current-password"
                  label="Contraseña"
                  labelPlacement="stacked"
                  placeholder="••••••••"
                  value={password}
                  onIonInput={(ev) => setPassword(String(ev.detail.value ?? ''))}
                />
              </IonItem>

              <div className="login-form__row">
                <label className="login-remember">
                  <input type="checkbox" name="remember" className="login-remember__input" />
                  <span className="login-remember__label">Recordarme</span>
                </label>
                <a href="#recuperar" className="login-forgot">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <IonButton type="submit" expand="block" className="login-submit">
                Entrar
              </IonButton>
            </form>

            <IonText color="medium">
              <p className="login-demo-hint">
                Modo exploración: el envío solo te lleva a inicio; aún no hay validación ni API.
              </p>
            </IonText>
          </section>

          <section className="login-footer">
            <p className="login-footer__signup">
              ¿No tienes cuenta?{' '}
              <a href="#registro" id="link-registro">
                Regístrate
              </a>
            </p>
            <nav aria-label="Legal" className="legal-links">
              <a href="#privacidad" id="link-privacidad">
                PRIVACIDAD
              </a>
              <a href="#terminos" id="link-terminos">
                TÉRMINOS
              </a>
              <a href="#ayuda" id="link-ayuda">
                AYUDA
              </a>
            </nav>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Login;
