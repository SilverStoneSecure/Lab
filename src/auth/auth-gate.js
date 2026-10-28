import crypto from 'node:crypto';
import argon2 from 'argon2';

function cookieSecure() {
  const v = process.env.SESSION_SECURE;
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashClientPassword(pw) {
  return argon2.hash(pw);
}

export async function verifyClientPassword(hash, pw) {
  return argon2.verify(hash, pw);
}

export function setClientSession(reply, userId, role) {
  reply.setCookie('client_session', `${userId}:${role}`, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSecure(),
    maxAge: 60 * 60 * 12,
    signed: true
  });
}

export function clearClientSession(reply) {
  reply.clearCookie('client_session', { path: '/', signed: true });
}

export function readClientSession(request) {
  const raw = request.cookies.client_session;
  if (!raw || !request.unsignCookie) return null;
  const unsigned = request.unsignCookie(raw);
  if (!unsigned.valid || !unsigned.value) return null;
  const [idStr, role] = unsigned.value.split(':');
  const userId = parseInt(idStr, 10);
  if (isNaN(userId)) return null;
  return { userId, role: role || 'client' };
}

export function authGateGuard(request, reply) {
  const session = readClientSession(request);
  if (!session) {
    reply.redirect('/portal/login');
    return null;
  }
  return session;
}

export function requireAdmin(request, reply) {
  const session = authGateGuard(request, reply);
  if (!session) return null;
  if (session.role !== 'admin') {
    reply.code(403).send('Forbidden');
    return null;
  }
  return session;
}
