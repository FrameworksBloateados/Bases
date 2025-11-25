/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router, Route, Routes} from 'react-router';
import {App} from './App';
import {LoginForm} from './components/LoginForm';
import {login, register} from './utils/auth';
import {RegisterForm} from './components/RegisterForm';
import {AuthProvider, useAuth} from './context/AuthContext';

function LoginPage() {
  const {login: setAuthToken} = useAuth();

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    const accessToken = await login(credentials);
    setAuthToken(accessToken);
  };

  return <LoginForm onSubmit={handleLogin} />;
}

function RegisterPage() {
  const {login: setAuthToken} = useAuth();

  const handleRegister = async (credentials: {
    email: string;
    password: string;
  }) => {
    const accessToken = await register(credentials);
    setAuthToken(accessToken);
  };

  return <RegisterForm onSubmit={handleRegister} />;
}

const elem = document.getElementById('root')!;
const app = (
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/register" element={<RegisterPage />}></Route>
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
