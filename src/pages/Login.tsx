import { IonContent, IonPage, IonText } from '@ionic/react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isCognitoConfigured } from '../auth/configureAmplify';
import './Login.css';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  if (isAuthenticated) {
    return <Redirect to="/home" />;
  }

  return (
    <IonPage className="login-page">
      <IonContent fullscreen className="login-content">
        <main className="login-layout">
          <section className="login-brand">
            <h1 className="login-brand__title">FactorSocial</h1>
            <p className="login-brand__tagline">Tu confianza digital, tu libertad financiera.</p>
          </section>

          <section className="login-card">
            {!isCognitoConfigured && (
              <IonText color="danger">
                <p className="login-config-warning">
                  Faltan variables VITE_COGNITO_* en tu entorno. Configura Amplify para iniciar sesión.
                </p>
              </IonText>
            )}

            <button
              type="button"
              className="google-button"
              id="btn-google-login"
              disabled={!isCognitoConfigured || isLoading}
              onClick={() => {
                void signIn();
              }}
            >
              <span className="google-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              </span>
              <span className="google-button__label">
                {isLoading ? 'Abriendo…' : 'Continuar con Google'}
              </span>
            </button>

            <div className="feature-grid">
              <article className="feature-item">
                <span className="feature-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <path
                      d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6l-9-4z"
                      fill="#1e7e6b"
                      opacity="0.15"
                    />
                    <path
                      d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6l-9-4z"
                      stroke="#1e7e6b"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="#1e7e6b"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="feature-item__label">BÓVEDA CIFRADA</p>
              </article>

              <article className="feature-item">
                <span className="feature-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <polyline
                      points="23 6 13.5 15.5 8.5 10.5 1 18"
                      stroke="#1e7e6b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="17 6 23 6 23 12"
                      stroke="#1e7e6b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="feature-item__label">
                  CRECIMIENTO
                  <br />
                  SOCIAL
                </p>
              </article>
            </div>
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
