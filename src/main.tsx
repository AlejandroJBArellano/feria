import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'aws-amplify/auth/enable-oauth-listener';
import { AuthProvider } from './auth/AuthContext';
import { configureAmplify } from './auth/configureAmplify';
import { ThemeProvider } from './theme/ThemeContext';

configureAmplify();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);