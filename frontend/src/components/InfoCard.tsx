import type {ReactNode} from 'react';

type InfoCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'slate';
};

/**
 * Reusable info card component for displaying user information
 * Used in ProfileSection to show username, email, balance, role
 */
export function InfoCard({icon, label, value, color}: InfoCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-300',
    purple:
      'from-purple-500/20 to-purple-600/20 border-purple-400/30 text-purple-300',
    green:
      'from-green-500/20 to-green-600/20 border-green-400/30 text-green-300',
    yellow:
      'from-yellow-500/20 to-yellow-600/20 border-yellow-400/30 text-yellow-300',
    slate:
      'from-slate-500/20 to-slate-600/20 border-slate-400/30 text-slate-300',
  };

  return (
    <div
      className={`bg-linear-to-br ${colorClasses[color]} border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <div className={`${colorClasses[color]}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-white font-semibold truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}
