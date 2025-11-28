import {InfoCard} from './InfoCard';
import {ActionButton} from './ActionButton';
import {
  UserProfileIcon,
  EmailIcon,
  MoneyIcon,
  ShieldIcon,
  KeyIcon,
  InfoCircleIcon,
} from './Icons';

type ProfileSectionProps = {
  userInfo: any;
  userError: string | null;
  onChangePassword: () => void;
  onChangeEmail: () => void;
};

/**
 * Profile section component for Dashboard
 * Displays user information and settings actions
 */
export function ProfileSection({
  userInfo,
  userError,
  onChangePassword,
  onChangeEmail,
}: ProfileSectionProps) {
  if (userError) {
    return (
      <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        Error: {userError}
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="text-slate-400 animate-pulse">
        Cargando información del usuario...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Mi Información</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon={<UserProfileIcon />}
          label="Usuario"
          value={userInfo.username}
          color="blue"
        />

        <InfoCard
          icon={<EmailIcon />}
          label="Email"
          value={userInfo.email}
          color="purple"
        />

        <InfoCard
          icon={<MoneyIcon />}
          label="Balance"
          value={`$${userInfo.balance}`}
          color="green"
        />

        <InfoCard
          icon={<ShieldIcon />}
          label="Rol"
          value={userInfo.admin ? 'Administrador' : 'Usuario'}
          color={userInfo.admin ? 'yellow' : 'slate'}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <ActionButton
          onClick={onChangePassword}
          icon={<KeyIcon />}
          label="Cambiar contraseña"
        />

        <ActionButton
          onClick={onChangeEmail}
          icon={<EmailIcon className="w-5 h-5" />}
          label="Cambiar email"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <InfoCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-slate-300">
              <span className="font-semibold">ID de cuenta:</span> {userInfo.id}
            </p>
            <p className="text-slate-400 mt-1">
              <span className="font-semibold">Creada:</span>{' '}
              {new Date(userInfo.created_at).toLocaleString('es-ES')}
            </p>
            <p className="text-slate-400">
              <span className="font-semibold">Última actualización:</span>{' '}
              {new Date(userInfo.updated_at).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
