import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect, useState } from 'react';
import { ToastProvider } from './components/Toast';

export default function App() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
      console.error('App error:', event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0a0e1a',
        color: '#fff',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Error Loading Application</h1>
          <p style={{ color: '#cbd5e1', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
            {error.message}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Check the browser console (F12) for more details.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
