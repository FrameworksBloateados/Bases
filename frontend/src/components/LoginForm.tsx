import {useState, type FormEvent} from 'react';
import {UsernameField} from './UsernameField';
import {PasswordField} from './PasswordField';
import {Link} from 'react-router-dom';
import {
  AuthPageLayout,
  AuthFormContainer,
  AuthFormHeader,
} from './AuthLayout';
import {Button} from './Button';
import {validatePassword} from '../utils/validation';
import {FormError} from './FormError';

interface LoginFormProps {
  onSubmit: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  onSuccess?: () => void;
}

export function LoginForm({onSubmit, onSuccess}: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({username, password});
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthFormContainer onSubmit={handleSubmit}>
        <AuthFormHeader
          icon={
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
          }
          title="¡Hola otra vez!"
          subtitle="Iniciá sesión para seguir quemando tus ahorros"
        />

        <UsernameField
          label="Nombre de usuario"
          username={username}
          onChangeHandler={setUsername}
        />

        <PasswordField
          label="Contraseña"
          password={password}
          onChangeHandler={setPassword}
        />

        <FormError message={error} className="mb-4 mt-2" />

        <Button
          type="submit"
          variant="gradient"
          isLoading={isLoading}
          className="w-full py-3 mt-2"
        >
          Iniciar sesión
        </Button>

        <p className="text-sm text-slate-300 mt-6 text-center">
          ¿Aún no tenés cuenta?{' '}
          <Link
            to="/register"
            className="text-white font-semibold hover:text-slate-200 transition-colors duration-200 underline decoration-2 decoration-slate-400"
          >
            Registrate acá
          </Link>
        </p>
      </AuthFormContainer>
    </AuthPageLayout>
  );
}
