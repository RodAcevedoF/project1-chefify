import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 5 minutes.",
  },
});

export const registerRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many registration attempts. Please try again after 5 minutes.",
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP. Please try again later.",
  },
});
