import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ru_orientation_team_secret_jwt_key_2026';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  createdAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Generate JWT helper
export function generateToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Auth Middleware to verify Bearer Token
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// GET /api/auth/me
export async function meHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  return res.json({ user: req.user });
}

// GET /api/auth/staff (Super Admin Only - reads from User table)
export async function getStaffHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return res.json({ staff: dbUsers });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch staff list', details: err.message });
  }
}

// DELETE /api/auth/staff/:id (Super Admin Only - deletes from User table)
export async function deleteStaffHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Staff account not found' });
    }

    if (user.email === req.user.email) {
      return res.status(400).json({ error: 'Cannot remove your own session/account' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Staff session revoked successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to revoke staff session', details: err.message });
  }
}

// POST /api/auth/google
export async function googleLoginHandler(req: Request, res: Response) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // Verify token using Google Tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid Google credential token' });
    }

    const payload = (await response.json()) as any;
    const email = payload.email;
    const name = payload.name;

    if (!email) {
      return res.status(400).json({ error: 'Google account has no email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdmin = cleanEmail === 'kapish.rohilla2024@nst.rishihood.edu.in';
    const isValidDomain = cleanEmail.endsWith('@rishihood.edu.in') || cleanEmail.endsWith('@nst.rishihood.edu.in');

    if (!isValidDomain) {
      return res.status(403).json({
        error: 'Access restricted to Rishihood University organization emails only'
      });
    }

    // Query or Create User inside database User table
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STAFF',
        }
      });
    } else if (isSuperAdmin && user.role !== 'SUPER_ADMIN') {
      user = await prisma.user.update({
        where: { email: cleanEmail },
        data: { role: 'SUPER_ADMIN' }
      });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Google login failed', details: error.message });
  }
}

// GET /api/auth/google/callback
export async function googleCallbackHandler(req: Request, res: Response) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Auto-detect redirect URI or fallback to standard callback path
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    // Exchange auth code for ID token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorDetail = await tokenResponse.text();
      return res.status(400).json({ error: 'Failed to exchange auth code', details: errorDetail });
    }

    const tokens = (await tokenResponse.json()) as any;
    const idToken = tokens.id_token;

    // Verify token using Google Tokeninfo API
    const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!verifyResponse.ok) {
      return res.status(400).json({ error: 'Invalid Google token exchanged' });
    }

    const payload = (await verifyResponse.json()) as any;
    const email = payload.email;
    const name = payload.name;

    if (!email) {
      return res.status(400).json({ error: 'Google account has no email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdmin = cleanEmail === 'kapish.rohilla2024@nst.rishihood.edu.in';
    const isValidDomain = cleanEmail.endsWith('@rishihood.edu.in') || cleanEmail.endsWith('@nst.rishihood.edu.in');

    if (!isValidDomain) {
      return res.status(403).send('<h1>Access Denied</h1><p>Only @rishihood.edu.in organization emails are allowed.</p>');
    }

    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STAFF',
        }
      });
    } else if (isSuperAdmin && user.role !== 'SUPER_ADMIN') {
      user = await prisma.user.update({
        where: { email: cleanEmail },
        data: { role: 'SUPER_ADMIN' }
      });
    }

    const token = generateToken(user);

    const referer = req.get('referer');
    const baseFrontendUrl = process.env.FRONTEND_URL || (referer ? new URL(referer).origin : 'http://localhost:3000');
    const redirectUrl = new URL(baseFrontendUrl);
    redirectUrl.searchParams.set('google_jwt_token', token);

    return res.redirect(redirectUrl.toString());
  } catch (error: any) {
    return res.status(500).json({ error: 'Google callback failed', details: error.message });
  }
}
