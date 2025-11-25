interface PasswordFieldProps {
  label: string;
  password: string;
  onChangeHandler: (value: string) => void;
}
export function PasswordField({
  label,
  password,
  onChangeHandler,
}: PasswordFieldProps) {
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
        placeholder="••••••••"
        className="w-full px-4 py-3 bg-white/20 text-white placeholder-slate-400 border border-white/30 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/50 transition-all duration-200"
      />
    </div>
  );
}
