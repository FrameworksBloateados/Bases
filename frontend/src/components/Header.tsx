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
        <div className="flex justify-between items-center">
          <UserInfo userInfo={userInfo} />
          <UserMenu 
            showMenu={showUserMenu}
            isClosing={isClosing}
            onToggleMenu={handleToggleMenu}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

function UserInfo({userInfo}: {userInfo: WhoAmIResponse | null}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Casa de apuestas de los Fundamentalistas de Frameworks Bloateados</h1>
      <p className="text-slate-300">
        Balance: <span className="font-semibold text-green-400">${userInfo?.balance}</span>
        <br/>
        Usuario: <span className="font-semibold">{userInfo?.username}</span>
      </p>
    </div>
  );
}

type UserMenuProps = {
  showMenu: boolean;
  isClosing: boolean;
  onToggleMenu: () => void;
  onLogout: () => void;
};

function UserMenu({showMenu, isClosing, onToggleMenu, onLogout}: UserMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggleMenu}
        className="px-4 py-2 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg shadow-lg transition-colors duration-300 active:scale-99 flex items-center gap-2"
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${showMenu && !isClosing ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showMenu && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={onToggleMenu}
          />
          <div className={`absolute right-0 mt-2 w-48 bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden origin-top ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}>
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
