function cookieSecure() {
  const v = process.env.SESSION_SECURE;
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return process.env.NODE_ENV === "production";
}

export function setSession(reply, user) {
  reply.setCookie("lab_session", JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role
  }), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    maxAge: 60 * 60 * 12,
    signed: true
  });
}

export function clearSession(reply) {
  reply.clearCookie("lab_session", { path: "/", signed: true });
}

export function readSession(request) {
  const raw = request.cookies.lab_session;
  if (!raw || !request.unsignCookie) return null;
  const unsigned = request.unsignCookie(raw);
  if (!unsigned.valid || !unsigned.value) return null;
  try {
    return JSON.parse(unsigned.value);
  } catch {
    return null;
  }
}
