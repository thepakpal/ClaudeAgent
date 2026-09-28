// Minimal single-password auth for a personal, single-user app.
// The session cookie is a deterministic hash of the correct password plus a
// server-only secret — anyone who already knows ADMIN_PASSWORD could derive
// it, which is fine here: knowing the password is exactly the bar to clear.
export const SESSION_COOKIE = "session";

export async function expectedSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.SESSION_SECRET || "";
  const enc = new TextEncoder();
  const data = enc.encode(`${password}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkPassword(candidate: string): Promise<boolean> {
  return candidate === (process.env.ADMIN_PASSWORD || "");
}
