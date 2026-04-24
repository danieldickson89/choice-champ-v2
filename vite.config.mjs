import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for Choice Champ.
// - Dev server on :3000 (matches Supabase Auth redirect allowlist)
// - Build output goes to /build so Vercel's existing config keeps working
export default defineConfig({
    plugins: [react()],
    server: { port: 3000, open: false },
    build: { outDir: 'build' },
});
