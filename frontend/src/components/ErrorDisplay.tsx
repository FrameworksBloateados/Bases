type ErrorDisplayProps = {
  message: string;
};

export function ErrorDisplay({message}: ErrorDisplayProps) {
  return (
    <div className="max-w-[1600px] mx-auto mb-6">
      <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm animate-slideDown animate-shake">
        <p className="text-sm text-red-200 font-medium">{message}</p>
      </div>
    </div>
  );
}
