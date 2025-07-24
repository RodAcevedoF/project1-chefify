import rateLimit from "express-rate-limit";

// Limita intentos de login
export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 5 minutes."
  }
});

// Limita intentos de registro
export const registerRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many registration attempts. Please try again after 5 minutes."
  }
});

// Limita peticiones generales por IP
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP. Please try again later."
  }
});
