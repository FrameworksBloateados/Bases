import {useState, type FormEvent} from 'react';
import {UsernameField} from './UsernameField';
import {EmailField} from './EmailField';
import {PasswordField} from './PasswordField';
import {Link} from 'react-router-dom';

interface RegisterFormProps {
  onSubmit: (credentials: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onSuccess?: () => void;
}

export function RegisterForm({onSubmit, onSuccess}: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (repeatedPassword !== password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({username, email, password});
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear la cuenta. Intentá de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient relative overflow-hidden py-4 px-4 sm:px-0">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Creá tu cuenta
          </h2>
          <p className="text-slate-300 text-sm">
            ¡Unite a nosotros y arruiná tu vida financiera!
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm animate-slideDown">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 mr-3 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        <UsernameField
          label={'Nombre de usuario'}
          username={username}
          onChangeHandler={setUsername}
        />

        <EmailField label={'Email'} email={email} onChangeHandler={setEmail} />

        <PasswordField
          label={'Contraseña'}
          password={password}
          onChangeHandler={setPassword}
        />
        <PasswordField
          label={'Confirmar contraseña'}
          password={repeatedPassword}
          onChangeHandler={setRepeatedPassword}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-2 font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-sm text-slate-300 mt-6 text-center">
          ¿Ya apostaste con nosotros?{' '}
          <Link
            to="/login"
            className="text-white font-semibold hover:text-slate-200 transition-colors duration-200 underline decoration-2 decoration-slate-400"
          >
            Iniciá sesión acá
          </Link>
        </p>
      </form>
    </div>
  );
}
