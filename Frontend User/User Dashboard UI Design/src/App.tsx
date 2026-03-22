import React from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { UserPanelProvider } from './context/UserPanelContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <UserPanelProvider>
        <RouterProvider router={router} />
      </UserPanelProvider>
    </ThemeProvider>
  );
}
