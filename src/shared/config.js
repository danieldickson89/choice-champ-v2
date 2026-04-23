// Single source of truth for the backend URL.
// Override via REACT_APP_BACKEND_URL in .env.local for local dev.
export const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    'https://choice-champ-backend-181ffd005e9f.herokuapp.com';
