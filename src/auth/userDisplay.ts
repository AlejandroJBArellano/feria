/**
 * Friendly label for greetings when Cognito federated username (e.g. google_…) is not a real name.
 */

export type UserDisplayInput = {
  name?: string;
  email?: string;
  username: string;
  provider: string;
};

export function getUserDisplayLabel(user: UserDisplayInput | null | undefined): string {
  if (!user) {
    return 'Usuario autenticado';
  }

  const rawName = user.name?.trim();
  if (rawName) {
    return rawName;
  }

  const email = user.email?.trim();
  if (email) {
    const at = email.indexOf('@');
    if (at > 0) {
      return email.slice(0, at);
    }
    return email;
  }

  const { username } = user;
  if (/^google_/i.test(username)) {
    return 'Usuario de Google';
  }
  if (/^facebook_/i.test(username)) {
    return 'Usuario de Facebook';
  }
  if (/^signinwithapple_/i.test(username)) {
    return 'Usuario de Apple';
  }

  return username;
}
