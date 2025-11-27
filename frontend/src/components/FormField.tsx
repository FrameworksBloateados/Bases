import type {InputHTMLAttributes} from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChangeHandler: (value: string) => void;
  error?: string | null;
  showError?: boolean;
}

export function FormField({
  label,
  value,
  onChangeHandler,
  error,
  showError = false,
  className = '',
  ...inputProps
}: FormFieldProps) {
  const hasError = showError && error;

  return (
    <div className={`mb-5 ${className}`}>
      <label className="block text-sm font-semibold text-white mb-2">
        {label}
      </label>
      <input
        {...inputProps}
        value={value}
        onChange={e => onChangeHandler(e.target.value)}
        className={`w-full px-4 py-3 bg-white/20 text-white placeholder-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
          hasError
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
            : 'border-white/30 focus:border-slate-400 focus:ring-slate-400/50'
        }`}
      />
      {hasError && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}
