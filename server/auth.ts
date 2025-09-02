import bcrypt from "bcryptjs";
import { eq, or, sql } from "drizzle-orm";
import { db } from "./db";
import { users, sessions, type User } from "@shared/schema";
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export interface AuthRequest extends Request {
  user?: User;
}

export class AuthService {
  private static readonly SESSION_COOKIE_NAME = "session_id";
  private static readonly SESSION_DURATION_DAYS = 30;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateSessionId(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static async createSession(userId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_DURATION_DAYS);

    await db.insert(sessions).values({
      id: sessionId,
      userId,
      expiresAt,
    });

    return sessionId;
  }

  static async getSessionUser(sessionId: string): Promise<User | null> {
    const result = await db
      .select()
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const session = result[0].sessions;
    const user = result[0].users;

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await this.deleteSession(sessionId);
      return null;
    }

    return user;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  static async cleanupExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`expires_at < NOW()`);
  }

  static async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: User; sessionId: string } | { error: string }> {
    try {
      // Check if username or email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(or(eq(users.username, userData.username), eq(users.email, userData.email)))
        .limit(1);

      if (existingUser.length > 0) {
        if (existingUser[0].username === userData.username) {
          return { error: "Username already exists" };
        }
        return { error: "Email already exists" };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Set trial end date (2 weeks from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      // Create user with trial
      const newUser = await db
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword,
          subscriptionStatus: "trial",
          trialEndsAt,
        })
        .returning();

      const user = newUser[0];

      // Create session
      const sessionId = await this.createSession(user.id);

      return { user, sessionId };
    } catch (error) {
      console.error("Registration error:", error);
      return { error: "Registration failed" };
    }
  }

  static async login(usernameOrEmail: string, password: string): Promise<{ user: User; sessionId: string } | { error: string }> {
    try {
      // Find user by username or email
      const userResult = await db
        .select()
        .from(users)
        .where(or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail)))
        .limit(1);

      if (userResult.length === 0) {
        return { error: "Invalid credentials" };
      }

      const user = userResult[0];

      if (!user.isActive) {
        return { error: "Account is deactivated" };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return { error: "Invalid credentials" };
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      // Create session
      const sessionId = await this.createSession(user.id);

      return { user, sessionId };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "Login failed" };
    }
  }

  static setSessionCookie(res: Response, sessionId: string): void {
    res.cookie(this.SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
  }

  static clearSessionCookie(res: Response): void {
    res.clearCookie(this.SESSION_COOKIE_NAME);
  }
}

// Authentication middleware
export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = req.cookies?.session_id;
    
    if (!sessionId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await AuthService.getSessionUser(sessionId);
    
    if (!user) {
      AuthService.clearSessionCookie(res);
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

// Optional authentication middleware (doesn't require auth)
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = req.cookies?.session_id;
    
    if (sessionId) {
      const user = await AuthService.getSessionUser(sessionId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue even if auth fails
  }
}