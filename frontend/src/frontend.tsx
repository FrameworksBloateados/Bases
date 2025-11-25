/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes, Link} from "react-router";
import { App } from "./App";
import { LoginForm } from "./components/LoginForm";
import { login } from "./utils/auth";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}></Route>  
        <Route path="/register" element={<LoginForm  onSubmit={login}/>}></Route>
        <Route path="/login" element={<LoginForm  onSubmit={login}/>}></Route>
      </Routes>
    </Router>
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
