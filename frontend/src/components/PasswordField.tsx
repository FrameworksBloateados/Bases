interface PasswordFieldProps {
  label: string;
  password: string;
  onChangeHandler: (value: string) => void;
  minLength?: number;
  showValidation?: boolean;
}
export function PasswordField({
  label,
  password,
  onChangeHandler,
  minLength = 8,
  showValidation = true,
}: PasswordFieldProps) {
  const isValid = password.length === 0 || password.length >= minLength;
  const showError = showValidation && password.length > 0 && !isValid;

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-white mb-2">
        {label}
      </label>
      <input
        type="password"
        value={password}
        onChange={e => onChangeHandler(e.target.value)}
        required
        minLength={minLength}
        placeholder="••••••••"
        className={`w-full px-4 py-3 bg-white/20 text-white placeholder-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
          showError
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
            : 'border-white/30 focus:border-slate-400 focus:ring-slate-400/50'
        }`}
      />
      {showError && (
        <p className="mt-1 text-xs text-red-300">
          La contraseña debe tener al menos {minLength} caracteres
        </p>
      )}
    </div>
  );
}
