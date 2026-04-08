/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**'],
    // Valores de prueba para import.meta.env (evita logs de auth y avisos de Amplify sin configurar).
    env: {
      VITE_AUTH_DEBUG: 'false',
      VITE_COGNITO_REGION: 'us-east-1',
      VITE_COGNITO_USER_POOL_ID: 'us-east-1_testPool',
      VITE_COGNITO_USER_POOL_CLIENT_ID: '0123456789abcdefghijklmnop',
      VITE_COGNITO_DOMAIN: 'test.auth.us-east-1.amazoncognito.com',
      VITE_COGNITO_REDIRECT_SIGN_IN: 'http://localhost:5173/',
      VITE_COGNITO_REDIRECT_SIGN_OUT: 'http://localhost:5173/',
      VITE_CHAT_WS_URL: 'wss://ci-test.example.invalid/ws',
    },
  }
})
