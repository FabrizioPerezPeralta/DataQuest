import React from 'react';
import type { ViewType } from '../types';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const navItems: { id: ViewType; icon: string; label: string }[] = [
  { id: 'dashboard',     icon: '📊', label: 'Dashboard' },
  { id: 'normalization', icon: '🔧', label: 'Normalización' },
  { id: 'dataquest',     icon: '🗺️', label: 'DataQuest' },
  { id: 'games',         icon: '🎮', label: 'Juegos y Retos' },
  { id: 'leaderboard',   icon: '🏆', label: 'Puntuaciones' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuthStore();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
            🎓
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-tight">DataQuest</h1>
            <p className="text-xs text-slate-500 font-medium">Normalization Lab</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 border-t border-slate-700/50" />

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 bg-slate-800/80 rounded-lg px-3 py-2">
          <span className="text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 stagger">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Menú Principal
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`sidebar-link relative w-full text-left animate-slide-left ${
              currentView === item.id ? 'active' : ''
            }`}
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <span>{item.label}</span>
            {currentView === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-slate-700/50" />

      {/* User Info */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {(user?.apodo || 'U').substring(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 font-medium truncate">{user?.apodo || 'Invitado'}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${user?.role === 'administrador' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {user?.role === 'administrador' ? 'Administrador' : 'Aprendiz'}
            </p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              logout();
            }}
            className="text-slate-500 hover:text-red-400 transition-colors text-sm"
            title="Cerrar sesión"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
};
