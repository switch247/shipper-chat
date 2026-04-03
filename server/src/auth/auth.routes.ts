import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import {authMiddleware} from '../middleware/auth.js';
const router = Router();
// Construct OAuth2Client with client secret to allow code exchange
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Internal Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isBot) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (user.password && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      await createAndSetRefreshToken(user.id, res);
      return res.status(200).json({ token, user });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Internal register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` },
    });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    await createAndSetRefreshToken(user.id, res);
    return res.status(200).json({ token, user });
  } catch (error) {
    if ((error as any).code === 'P2002') return res.status(400).json({ error: 'User already exists' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: create refresh token record and set httpOnly cookie
async function createAndSetRefreshToken(userId: string, res: any) {
  const token = crypto.randomBytes(40).toString('hex');
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  try {
    await prisma.refreshToken.create({ data: { token, userId, expiresAt: expires } });
  } catch (err) {
    console.warn('Failed to persist refresh token', err);
  }
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // For cross-site refresh requests (e.g. from Vercel deployed client) we need 'none' and secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    expires,
    path: '/',
  };
  res.cookie('refresh_token', token, cookieOpts);
}

// Google OAuth Login
router.post('/google', async (req, res) => {
  const { token } = req.body; // Google Credential ID Token

  try {
    const ticket = (await client.verifyIdToken({
      idToken: token as string,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    })) as any;
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ error: 'Auth failed' });

    let user = await prisma.user.findUnique({ where: { email: payload.email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || 'User',
          avatar: payload.picture,
          googleId: payload.sub,
        },
      });
    }

    const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    await createAndSetRefreshToken(user.id, res);
    return res.status(200).json({ token: jwtToken, user });
  } catch (error) {
    console.error('[GoogleAuth] Error:', error);
    return res.status(500).json({ error: 'Auth failed' });
  }
});

// Refresh token endpoint - rotates refresh token and issues new access token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const stored = await prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Revoke old token
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    // Create new refresh token (rotation)
    const newToken = crypto.randomBytes(40).toString('hex');
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: newToken, userId: stored.userId, expiresAt: expires } });
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      expires,
      path: '/',
    };
    res.cookie('refresh_token', newToken, cookieOpts);

    const jwtToken = jwt.sign({ id: stored.user.id, email: stored.user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ token: jwtToken, user: stored.user });
  } catch (err) {
    console.error('[Auth Refresh] Error:', err);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout - revoke refresh token cookie and clear
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
    }
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Auth Logout] Error:', err);
    return res.status(500).json({ error: 'Failed to logout' });
  }
});

// (export moved to end after all routes)

// Authorization Code exchange (redirect flow)
// NOTE: Keep this at the bottom so it doesn't conflict with existing routes above
router.post('/google/code', async (req, res) => {
  const { code, redirectUri } = req.body;

  if (!code || !redirectUri) return res.status(400).json({ error: 'Missing code or redirectUri' });

  try {
    // Exchange code for tokens
    const tokenResponse = await client.getToken({ code, redirect_uri: redirectUri });
    const tokens = tokenResponse.tokens as any;

    const idToken = tokens.id_token;
    if (!idToken) return res.status(400).json({ error: 'No id_token returned from provider' });

    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID as string }) as any;
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ error: 'Auth failed' });

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || 'User',
          avatar: payload.picture,
          googleId: payload.sub,
        },
      });
    }

    // Note: tokens.refresh_token may be present on first consent. We are not persisting it yet.

    const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ token: jwtToken, user });
  } catch (error) {
    console.error('[GoogleCodeExchange] Error:', error);
    return res.status(500).json({ error: 'Auth failed' });
  }
});

export default router;
