import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginScreen from './components/Auth/LoginScreen';
import Dashboard from './components/Dashboard/Dashboard';
import type { UserProfile } from './types';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';

// Get Client ID from environment or use a placeholder
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing-client-id';

function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken') || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <LanguageProvider>
        <div className="min-h-screen bg-[#f8f9fa] text-text">
          {!user || !accessToken ? (
            <LoginScreen onLogin={(u, token) => {
              setUser(u);
              setAccessToken(token);
            }} />
          ) : (
            <Dashboard
              user={user}
              accessToken={accessToken}
              onLogout={() => {
                setUser(null);
                setAccessToken(null);
              }}
            />
          )}
        </div>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
