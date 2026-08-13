// Base API and Socket URL configuration
// In development: defaults to 'http://localhost:5000'
// In production (Vercel): uses the VITE_API_URL environment variable (your Render backend URL)
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : 'http://localhost:5000';
