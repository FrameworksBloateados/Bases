type FormErrorProps = {
  message: string | null;
  className?: string;
};

export function FormError({message, className = ''}: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-slideDown animate-shake ${className}`}
    >
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  );
}
