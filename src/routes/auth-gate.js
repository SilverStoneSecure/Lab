import crypto from 'node:crypto';
import {
  hashClientPassword,
  verifyClientPassword,
  setClientSession,
  clearClientSession,
  authGateGuard,
  requireAdmin
} from '../auth/auth-gate.js';

const USER_CAP = 10;

export async function registerAuthGateRoutes(app) {
  const db = app.db;

  // GET /portal/register?token=<token>
  app.get('/portal/register', async (request, reply) => {
    const { token } = request.query;
    if (!token) {
      return reply.view('auth-gate/register.njk', {
        error: 'Invalid or missing registration link.'
      });
    }
    const reg = db
      .prepare("SELECT token FROM registration_sessions WHERE token = ? AND completed_at IS NULL AND (expires_at IS NULL OR expires_at > datetime('now'))")
      .get(token);
    if (!reg) {
      return reply.view('auth-gate/register.njk', {
        error: 'This registration link is invalid or has already been used.'
      });
    }
    return reply.view('auth-gate/register.njk', { token });
  });

  // POST /portal/register
  app.post('/portal/register', async (request, reply) => {
    const { token, username, password } = request.body;

    const reg = db
      .prepare("SELECT token FROM registration_sessions WHERE token = ? AND completed_at IS NULL AND (expires_at IS NULL OR expires_at > datetime('now'))")
      .get(token);
    if (!reg) {
      return reply.view('auth-gate/register.njk', {
        error: 'Invalid or expired registration link.',
        token
      });
    }

    const existing = db
      .prepare('SELECT id FROM client_users WHERE username = ?')
      .get(username);
    if (existing) {
      return reply.view('auth-gate/register.njk', {
        error: 'That username is already taken.',
        token
      });
    }

    const hash = await hashClientPassword(password);
    const result = db
      .prepare('INSERT INTO client_users (username, password_hash) VALUES (?, ?)')
      .run(username, hash);
    const userId = result.lastInsertRowid;

    const count = db.prepare('SELECT COUNT(*) as n FROM client_users').get().n;
    const role = count === 1 ? 'admin' : 'client';
    db.prepare('UPDATE client_users SET role = ? WHERE id = ?').run(role, userId);

    db.prepare('UPDATE registration_sessions SET completed_at = CURRENT_TIMESTAMP WHERE token = ?')
      .run(token);

    setClientSession(reply, userId, role);
    return reply.redirect('/');
  });

  // GET /portal/login
  app.get('/portal/login', async (request, reply) => {
    return reply.view('auth-gate/login.njk', {});
  });

  // POST /portal/login
  app.post('/portal/login', async (request, reply) => {
    const { username, password } = request.body;

    const user = db
      .prepare('SELECT id, password_hash, role, archived_at FROM client_users WHERE username = ?')
      .get(username);
    if (!user) {
      return reply.view('auth-gate/login.njk', { error: 'Invalid username or password.' });
    }

    if (user.archived_at) {
      return reply.view('auth-gate/login.njk', { error: 'Invalid username or password.' });
    }

    const ok = await verifyClientPassword(user.password_hash, password);
    if (!ok) {
      return reply.view('auth-gate/login.njk', { error: 'Invalid username or password.' });
    }

    setClientSession(reply, user.id, user.role);
    return reply.redirect('/');
  });

  // GET /portal/logout
  app.get('/portal/logout', async (request, reply) => {
    clearClientSession(reply);
    return reply.redirect('/portal/login');
  });

  // GET /portal/users
  app.get('/portal/users', async (request, reply) => {
    const session = authGateGuard(request, reply);
    if (!session) return;

    const users = db
      .prepare('SELECT id, username, role, created_at, archived_at FROM client_users ORDER BY created_at ASC')
      .all();
    const totalActive = users.filter(u => !u.archived_at).length;
    const atCap = totalActive >= USER_CAP;

    return reply.view('auth-gate/users.njk', {
      users,
      role: session.role,
      totalActive,
      atCap,
      cap: USER_CAP,
      inviteSuccess: request.query.invited || null,
      inviteLink: request.query.link || null,
    });
  });

  // POST /portal/users/invite — admin only
  app.post('/portal/users/invite', async (request, reply) => {
    const session = requireAdmin(request, reply);
    if (!session) return;

    const totalActive = db.prepare('SELECT COUNT(*) as n FROM client_users WHERE archived_at IS NULL').get().n;
    if (totalActive >= USER_CAP) {
      return reply.redirect('/portal/users?error=cap');
    }

    const token = crypto.randomBytes(32).toString('hex');
    db.prepare("INSERT INTO registration_sessions (token, expires_at) VALUES (?, datetime('now', '+7 days'))")
      .run(token);

    const host = request.headers.host || 'lab.silverstonesecure.com';
    const magicLink = `https://${host}/portal/register?token=${token}`;

    return reply.redirect(`/portal/users?invited=1&link=${encodeURIComponent(magicLink)}`);
  });

  // POST /portal/users/revoke/:id — admin only
  app.post('/portal/users/revoke/:id', async (request, reply) => {
    const session = requireAdmin(request, reply);
    if (!session) return;

    const targetId = parseInt(request.params.id, 10);
    if (targetId === session.userId) {
      return reply.redirect('/portal/users?error=self_revoke');
    }

    db.prepare('UPDATE client_users SET archived_at = CURRENT_TIMESTAMP WHERE id = ?').run(targetId);
    db.prepare('DELETE FROM client_sessions WHERE client_user_id = ?').run(targetId);

    return reply.redirect('/portal/users?revoked=1');
  });
}
