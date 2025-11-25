import { useState, type FormEvent } from "react";
import { PasswordField } from "./PasswordField";
import { Link } from "react-router-dom";

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string; }) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-neutral-800 border border-red-600 shadow-[0_0_15px_rgba(255,50,50,0.4)] rounded-lg"
      >
        <h2 className="text-2xl font-extrabold text-center text-orange-500 mb-6 tracking-wide">
          Player Login
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-700 text-gray-200 border border-neutral-600 rounded-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
        </div>

        <PasswordField text={"Password"} password={password} onChangeHandler={setPassword}/>

        <button
          type="submit"
          className="w-full py-2 font-bold uppercase text-gray-50 bg-red-600 hover:bg-red-700 border-b-4 border-red-900 rounded-md transition-all duration-200 active:translate-y-0.5 active:border-red-800"
        >
          Enter Arena
        </button>
        <p className="text-sm text-gray-400 mt-4 text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-red-500 hover:text-red-400">
            Login
        </Link>
        </p>
      </form>
    </div>
  );
}

