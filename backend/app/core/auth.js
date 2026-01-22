import jwt from "jsonwebtoken";
import { query } from "../db/connection.js";
import bcrypt from "bcrypt";

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL_ERROR: JWT_SECRET is not defined in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const BCRYPT_ROUNDS = 12; // Cost factor for bcrypt hashing

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    tenant_id: user.tenant_id,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const authenticateUser = async (username, password) => {
  try {
    const result = await query(
      "SELECT id, username, password_hash, role, tenant_id FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    const { password_hash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No authorization header provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Optionally, verify user still exists in database
    const userResult = await query(
      "SELECT id, username, role, tenant_id FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user info to request object
    req.user = userResult.rows[0];
    req.token = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Role-based authorization middleware
 * Use after authenticate middleware
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: Insufficient permissions",
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};
