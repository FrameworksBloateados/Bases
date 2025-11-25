import { password } from "bun";
import { APITester } from "./APITester";
import "./index.css";
// src/pages/Login.jsx
import { LoginForm } from "./components/LoginForm";
import { login } from "./utils/auth";


export function App() {

  return (
    <div className="app">
      <LoginForm onSubmit={login}/>
    </div>
  );
}


export default App;
