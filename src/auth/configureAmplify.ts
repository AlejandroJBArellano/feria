import { Amplify } from 'aws-amplify';

const cognitoRegion = import.meta.env.VITE_COGNITO_REGION;
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID;
const domain = import.meta.env.VITE_COGNITO_DOMAIN;
const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN;
const redirectSignOut = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT;

/** Comma-separated; must match "Allowed OAuth scopes" on the Cognito app client. Default: openid,email */
function parseOAuthScopes(): string[] {
  const raw = import.meta.env.VITE_COGNITO_OAUTH_SCOPES as string | undefined;
  if (raw && raw.trim().length > 0) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ['openid', 'email'];
}

export const isCognitoConfigured = Boolean(
  cognitoRegion && userPoolId && userPoolClientId && domain && redirectSignIn && redirectSignOut
);

export function configureAmplify(): void {
  if (!isCognitoConfigured) {
    console.warn('Cognito is not configured. Check VITE_COGNITO_* environment variables.');
    return;
  }

  const safeUserPoolId = userPoolId as string;
  const safeUserPoolClientId = userPoolClientId as string;
  const safeDomain = domain as string;
  const safeRedirectSignIn = redirectSignIn as string;
  const safeRedirectSignOut = redirectSignOut as string;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: safeUserPoolId,
        userPoolClientId: safeUserPoolClientId,
        loginWith: {
          oauth: {
            domain: safeDomain,
            scopes: parseOAuthScopes(),
            redirectSignIn: [safeRedirectSignIn],
            redirectSignOut: [safeRedirectSignOut],
            responseType: 'code'
          }
        }
      }
    }
  });
}