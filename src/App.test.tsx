import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';

test('renders without crashing', async () => {
  const { baseElement } = render(
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(baseElement.querySelector('ion-app')).toBeTruthy();
  });
});
