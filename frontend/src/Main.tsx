import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router, Route, Routes} from 'react-router';
import {App} from './App';
import {LoginForm} from './components/LoginForm';
import {login, register} from './utils/Auth';
import {RegisterForm} from './components/RegisterForm';

const elem = document.getElementById('root')!;
const app = (
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/login" element={<LoginForm onSubmit={login} />}></Route>
        <Route
          path="/register"
          element={<RegisterForm onSubmit={register} />}
        ></Route>
      </Routes>
    </Router>
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
