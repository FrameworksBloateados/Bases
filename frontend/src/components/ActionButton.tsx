import type {ReactNode} from 'react';

type ActionButtonProps = {
  onClick: () => void;
  icon: ReactNode;
  label: string;
};

/**
 * Reusable action button for ProfileSection
 * Used for "Cambiar contraseña" and "Cambiar email" buttons
 */
export function ActionButton({onClick, icon, label}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg p-4 shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 group"
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );
}
