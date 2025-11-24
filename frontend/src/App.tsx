import { APITester } from "./APITester";
import "./index.css";
// src/pages/Login.jsx
import { useState } from "react";
import { type FormEvent } from "react";


interface LoginFormProps {
  onSubmit: (credentials: { username: string; password: string }) => void;
}

function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ username, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <div>
        <label>
          Username:
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
        </label>
      </div>

      <div>
        <label>
          Password:
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </label>
      </div>

      <button type="submit">Sign In</button>
    </form>
  );
}


export function App() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  return (
    <div className="app">
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <LoginForm onSubmit={login}/>
    </div>
  );
}


function login (credentials: {username: string, password: string} ) {
  console.log(credentials)
}


export default App;
