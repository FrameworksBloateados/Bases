import type {ReactNode} from 'react';

type SidebarNavButtonProps = {
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
};

/**
 * Reusable navigation button for sidebar
 * Handles active/inactive states with consistent styling
 */
export function SidebarNavButton({
  label,
  icon,
  isActive,
  onClick,
}: SidebarNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 focus:outline-none select-none border ${
        isActive
          ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
          : 'text-slate-300 hover:bg-white/5 active:bg-white/10 border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
