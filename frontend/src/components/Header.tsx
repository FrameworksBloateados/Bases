import {useState} from 'react';
import type {WhoAmIResponse} from '../types/match.types';

type HeaderProps = {
  userInfo: WhoAmIResponse | null;
  onLogout: () => void;
};

export function Header({userInfo, onLogout}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleToggleMenu = () => {
    if (showUserMenu) {
      setIsClosing(true);
      setTimeout(() => {
        setShowUserMenu(false);
        setIsClosing(false);
      }, 200); // Duración de la animación
    } else {
      setShowUserMenu(true);
    }
  };

  const handleLogout = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowUserMenu(false);
      setIsClosing(false);
      onLogout();
    }, 200);
  };

  return (
    <div className="max-w-[1600px] mx-auto mb-8 relative z-100">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <UserInfo userInfo={userInfo} />
          <div className="self-end sm:self-auto">
            <UserMenu
              showMenu={showUserMenu}
              isClosing={isClosing}
              onToggleMenu={handleToggleMenu}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UserInfo({userInfo}: {userInfo: WhoAmIResponse | null}) {
  return (
    <div className="flex-1 min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 wrap-break-word bg-linear-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
        Casa de apuestas de los Fundamentalistas de Frameworks Bloateados
      </h1>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-slate-400 text-sm sm:text-base">
            {userInfo?.username}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-green-400 text-xs xs:text-base tracking-tight">
            ${userInfo?.balance}
          </span>
        </div>
      </div>
    </div>
  );
}

type UserMenuProps = {
  showMenu: boolean;
  isClosing: boolean;
  onToggleMenu: () => void;
  onLogout: () => void;
};

function UserMenu({
  showMenu,
  isClosing,
  onToggleMenu,
  onLogout,
}: UserMenuProps) {
  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={onToggleMenu}
        className="px-4 py-2 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg shadow-lg transition-colors duration-300 active:scale-99 flex items-center gap-2"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            showMenu && !isClosing ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggleMenu} />
          <div
            className={`absolute right-0 mt-2 w-48 bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden origin-top z-50 ${
              isClosing ? 'animate-slide-up' : 'animate-slide-down'
            }`}
          >
            <a
              href="/dashboard"
              className="block px-4 py-3 text-sm text-white hover:bg-slate-700 transition-colors"
            >
              Panel de control
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
