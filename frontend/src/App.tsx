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
    <form 
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-10 p-6 bg-white shadow-md rounded-lg border border-gray-200"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
      >
        Sign In
      </button>
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
