interface EmailFieldProps {
  label: string;
  email: string;
  onChangeHandler: (value: string) => void;
  showValidation?: boolean;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;

export function EmailField({
  label,
  email,
  onChangeHandler,
  showValidation = true,
}: EmailFieldProps) {
  const isValid = email.length === 0 || EMAIL_REGEX.test(email);
  const showError = showValidation && email.length > 0 && !isValid;

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-white mb-2">
        {label}
      </label>
      <input
        type="email"
        value={email}
        onChange={e => onChangeHandler(e.target.value)}
        required
        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]"
        placeholder="vos@dominio.tld"
        className={`w-full px-4 py-3 bg-white/20 text-white placeholder-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
          showError
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
            : 'border-white/30 focus:border-slate-400 focus:ring-slate-400/50'
        }`}
      />
      {showError && (
        <p className="mt-1 text-xs text-red-300">Ingresá un email válido</p>
      )}
    </div>
  );
}
