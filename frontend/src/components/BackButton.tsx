import {useNavigate} from 'react-router';

type BackButtonProps = {
  to?: string;
  label?: string;
  className?: string;
};

export function BackButton({to = '/', label = 'Volver a inicio', className = ''}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 flex items-center gap-2 ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </button>
  );
}
