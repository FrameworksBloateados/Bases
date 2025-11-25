import {useState, type FormEvent} from 'react';
import {PasswordField} from './PasswordField';
import {Link} from 'react-router-dom';

interface LoginFormProps {
  onSubmit: (credentials: {email: string; password: string}) => Promise<void>;
}

export function LoginForm({onSubmit}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({email, password});
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 left-10 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{animationDelay: '2s'}}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{animationDelay: '4s'}}
        ></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-black/50"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-linear-to-r from-slate-600 to-slate-500 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-300 text-sm">
            Sign in to continue your journey
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-white mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-white/20 text-white placeholder-slate-400 border border-white/30 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/50 transition-all duration-200"
          />
        </div>

        <PasswordField
          text={'Password'}
          password={password}
          onChangeHandler={setPassword}
        />

        <button
          type="submit"
          className="w-full py-3 mt-2 font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99"
        >
          Sign In
        </button>

        <p className="text-sm text-slate-300 mt-6 text-center">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-white font-semibold hover:text-slate-200 transition-colors duration-200 underline decoration-2 decoration-slate-400"
          >
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}
