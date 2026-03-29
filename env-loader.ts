/**
 * Environment preloader.
 * Must be imported BEFORE any module that reads process.env.
 * 
 * Loads .env.local (Vite convention) first, then .env as fallback.
 * Since ES module imports are hoisted, this file is imported via
 * tsx --import flag or as the first import in the entry point.
 */
import dotenv from 'dotenv';

// .env.local takes priority (same convention Vite uses)
dotenv.config({ path: '.env.local' });
// .env as fallback for any vars not in .env.local
dotenv.config({ path: '.env' });
