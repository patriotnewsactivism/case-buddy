import { Router } from "express";
import { AuthService, type AuthRequest } from "./auth";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Enhanced registration schema with validation
const registrationSchema = insertUserSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const validation = registrationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.format(),
      });
    }

    const { confirmPassword, ...userData } = validation.data;
    const result = await AuthService.register(userData);

    if ("error" in result) {
      return res.status(400).json({ error: result.error });
    }

    // Set session cookie
    AuthService.setSessionCookie(res, result.sessionId);

    // Don't send password back
    const { password, ...userWithoutPassword } = result.user;
    
    res.status(201).json({
      message: "Registration successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.format(),
      });
    }

    const { usernameOrEmail, password } = validation.data;
    const result = await AuthService.login(usernameOrEmail, password);

    if ("error" in result) {
      return res.status(401).json({ error: result.error });
    }

    // Set session cookie
    AuthService.setSessionCookie(res, result.sessionId);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = result.user;
    
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout endpoint
router.post("/logout", async (req: AuthRequest, res) => {
  try {
    const sessionId = req.cookies?.session_id;
    
    if (sessionId) {
      await AuthService.deleteSession(sessionId);
    }
    
    AuthService.clearSessionCookie(res);
    
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user endpoint
router.get("/me", async (req: AuthRequest, res) => {
  try {
    const sessionId = req.cookies?.session_id;
    
    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await AuthService.getSessionUser(sessionId);
    
    if (!user) {
      AuthService.clearSessionCookie(res);
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Don't send password back
    const { password, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check authentication status
router.get("/status", async (req: AuthRequest, res) => {
  try {
    const sessionId = req.cookies?.session_id;
    
    if (!sessionId) {
      return res.json({ authenticated: false });
    }

    const user = await AuthService.getSessionUser(sessionId);
    
    res.json({ 
      authenticated: !!user,
      user: user ? { id: user.id, username: user.username, email: user.email, role: user.role } : null
    });
  } catch (error) {
    console.error("Auth status error:", error);
    res.json({ authenticated: false });
  }
});

export default router;