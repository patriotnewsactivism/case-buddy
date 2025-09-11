
// Simple client-side auth with optional 2FA simulation
const USER_KEY = 'cb_user';
const TOKEN_KEY = 'cb_token';
const TRIAL_KEY = 'cb_trial_start';

export function signIn(email, password) {
  // In production: call backend. Here: accept any non-empty values
  if (!email || !password) throw new Error('Missing credentials');
  const user = { email, name: email.split('@')[0], twoFA: true };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // if 2FA enabled, we don't set token yet
  return user;
}

export function verify2FA(code) {
  // Accept 6-digit numeric codes "123456" or any 6 digits for demo
  if (!/^[0-9]{6}$/.test(code)) throw new Error('Invalid code');
  const token = Math.random().toString(36).slice(2);
  localStorage.setItem(TOKEN_KEY, token);
  if (!localStorage.getItem(TRIAL_KEY)) {
    localStorage.setItem(TRIAL_KEY, String(Date.now()));
  }
  return token;
}

export function isAuthed() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch { return null; }
}

export function signOut() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function trialInfo() {
  const start = Number(localStorage.getItem(TRIAL_KEY) || 0);
  const trialDays = 14; // two-week trial
  return { start, trialDays };
}
