import {useState, type FormEvent} from 'react';
import {UsernameField} from './UsernameField';
import {EmailField} from './EmailField';
import {PasswordField} from './PasswordField';
import {Link} from 'react-router-dom';
import {AuthPageLayout, AuthFormContainer, AuthFormHeader} from './AuthLayout';
import {Button} from './Button';
import {validatePassword, validatePasswordMatch} from '../utils/validation';
import {useFormError} from '../hooks/useFormError';
import {ErrorMessage} from './ErrorMessage';

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
  const {displayError, setError, clearError} = useFormError();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const matchError = validatePasswordMatch(password, repeatedPassword);
    if (matchError) {
      setError(matchError);
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({username, email, password});
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al crear la cuenta. Intentá de nuevo.'
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          }
          title="Creá tu cuenta"
          subtitle="¡Unite a nosotros y arruiná tu vida financiera!"
        />

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
          label={'Repetir contraseña'}
          password={repeatedPassword}
          onChangeHandler={setRepeatedPassword}
        />

        <ErrorMessage message={displayError} className="mb-4 mt-2" />

        <Button
          type="submit"
          variant="gradient"
          isLoading={isLoading}
          className="w-full py-3 mt-2"
        >
          Crear cuenta
        </Button>

        <p className="text-sm text-slate-300 mt-6 text-center">
          ¿Ya apostaste con nosotros?{' '}
          <Link
            to="/login"
            className="text-white font-semibold hover:text-slate-200 transition-colors duration-200 underline decoration-2 decoration-slate-400"
          >
            Iniciá sesión acá
          </Link>
        </p>
      </AuthFormContainer>
    </AuthPageLayout>
  );
}
