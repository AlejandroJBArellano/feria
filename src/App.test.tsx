import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './auth/AuthContext';

test('renders without crashing', async () => {
  const { baseElement } = render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(baseElement.querySelector('ion-app')).toBeTruthy();
  });
});
