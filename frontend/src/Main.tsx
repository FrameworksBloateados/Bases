import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router, Route, Routes} from 'react-router';
import {App} from './App';
import {LoginForm} from './components/LoginForm';
import {RegisterForm} from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import {AuthProvider, useAuth} from './context/AuthContext';
import {Navigate} from 'react-router-dom';

const elem = document.getElementById('root')!;
function AppRoutes() {
  const {login, register, isAuthenticated, isLoading} = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          isLoading ? (
            <></>
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginForm
              onSuccess={() => {
                return;
              }}
              onSubmit={({email, password}) => login(email, password)}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isLoading ? (
            <></>
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterForm
              onSuccess={() => {
                return;
              }}
              onSubmit={({email, password}) => register(email, password)}
            />
          )
        }
      />
    </Routes>
  );
}

const app = (
  <StrictMode>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </StrictMode>
);

// Hot module reloading API is available in development.
if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
