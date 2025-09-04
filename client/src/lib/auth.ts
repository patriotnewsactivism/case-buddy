import GoTrue from "@netlify/gotrue-js";

export const auth = new GoTrue({
  APIUrl: `${window.location.origin}/.netlify/identity`,
  setCookie: true,
});

export async function getToken(): Promise<string | null> {
  const user = auth.currentUser();
  if (!user) return null;
  try { return await user.jwt(); } catch { return null; }
}
