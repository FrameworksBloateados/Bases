interface PasswordFieldProps {
  text: string;
  password: string;
  onChangeHandler: (value: string) => void;
}
export function PasswordField({ text, password, onChangeHandler }: PasswordFieldProps) {
  return <div className="mb-6">
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {text}
    </label>
    <input
      type="password"
      value={password}
      onChange={(e) => onChangeHandler(e.target.value)}
      required
      className="w-full px-3 py-2 bg-neutral-700 text-gray-200 border border-neutral-600 rounded-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
  </div>;
}
