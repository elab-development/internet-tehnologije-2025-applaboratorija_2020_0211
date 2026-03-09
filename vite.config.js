import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],

    // ─── Vitest konfiguracija ─────────────────────────────────
    test: {
        globals: true,           // describe/it/expect bez importa
        environment: 'jsdom',    // simulira browser DOM
        setupFiles: './src/tests/setup.js',
        css: false,              // ne parsira CSS u testovima
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.{js,jsx}'],
            exclude: ['src/tests/**', 'src/main.jsx'],
        },
    },
});
