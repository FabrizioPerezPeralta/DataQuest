// DashboardHome.tsx — Con skeleton loaders, XP animada, y skeleton screens
import React, { useState, useEffect } from 'react';
import { Zap, Trophy, BookOpen, Star, ArrowRight, TrendingUp } from 'lucide-react';
import type { ViewType } from '../types';
import { useAuthStore } from '../store/authStore';

interface Props {
  onNavigate: (view: ViewType) => void;
}

// Skeleton card
const SkeletonCard = () => (
  <div className="stat-card animate-fade-in">
    <div className="flex items-center justify-between mb-3">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="skeleton w-12 h-5 rounded-full" />
    </div>
    <div className="skeleton w-16 h-7 rounded mb-1" />
    <div className="skeleton w-24 h-4 rounded" />
  </div>
);

const quickActions: { icon: string; label: string; desc: string; view: ViewType; gradient: string; iconComp: React.ReactNode }[] = [
  { icon: '🔧', label: 'Normalizar Datos',  desc: 'Analiza un esquema paso a paso',  view: 'normalization', gradient: 'from-indigo-500 to-blue-600',   iconComp: <BookOpen className="w-5 h-5" /> },
  { icon: '🗺️', label: 'Iniciar DataQuest', desc: 'Misiones de aprendizaje guiadas', view: 'dataquest',     gradient: 'from-violet-500 to-purple-600', iconComp: <Star className="w-5 h-5" /> },
  { icon: '🎮', label: 'Jugar un Puzzle',   desc: 'Pon a prueba lo que aprendiste',  view: 'games',         gradient: 'from-emerald-500 to-teal-600',  iconComp: <Zap className="w-5 h-5" /> },
  { icon: '🏆', label: 'Ver Ranking',       desc: 'Compara tu progreso con otros',   view: 'leaderboard',   gradient: 'from-amber-500 to-orange-600',  iconComp: <Trophy className="w-5 h-5" /> },
];

const mastery = [
  { concept: '1FN — Atomicidad',           pct: 95, color: 'from-emerald-400 to-teal-500' },
  { concept: '2FN — Dep. Parciales',       pct: 78, color: 'from-indigo-400 to-blue-500' },
  { concept: '3FN — Dep. Transitivas',     pct: 62, color: 'from-violet-400 to-purple-500' },
  { concept: 'BCNF — Det. Clave',          pct: 40, color: 'from-amber-400 to-orange-500' },
  { concept: 'Dependencias Funcionales',   pct: 85, color: 'from-cyan-400 to-blue-500' },
];

const recentActivity = [
  { action: 'Validaste el esquema "Estudiantes"', time: 'Hace 2 min',   icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
  { action: 'Completaste el Puzzle #3 — 2FN',    time: 'Hace 15 min',  icon: '🧩', color: 'bg-violet-100 text-violet-700' },
  { action: 'Nuevo reto semanal disponible',      time: 'Hace 1 hora',  icon: '🔔', color: 'bg-amber-100 text-amber-700' },
  { action: 'Subiste a Normalizador Junior',      time: 'Hace 3 horas', icon: '🎖️', color: 'bg-blue-100 text-blue-700' },
  { action: 'Resolviste dependencias transitivas',time: 'Ayer',         icon: '📚', color: 'bg-rose-100 text-rose-700' },
];

export const DashboardHome: React.FC<Props> = ({ onNavigate }) => {
  const { user, isAuthenticated, isGuest } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const xp = user?.xp ?? 0;
  const xpToNextLevel = 500;
  const xpProgress = Math.min((xp % xpToNextLevel) / xpToNextLevel * 100, 100);

  const stats = [
    { icon: '📋', label: 'Esquemas Validados', value: 0,   color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { icon: '🧩', label: 'Puzzles Resueltos',  value: 0,   color: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { icon: '🏆', label: 'Retos Completados',  value: 0,   color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',   text: 'text-amber-600' },
    { icon: '⭐', label: 'XP Total',            value: xp,  color: 'from-rose-500 to-pink-500',    bg: 'bg-rose-50',    text: 'text-rose-600' },
  ];

  const displayName = isAuthenticated && user ? user.apodo : isGuest ? 'Explorador' : 'DataQuest';

  return (
    <div className="space-y-6">
      {/* Header with XP bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{displayName}</span> 🎓
          </h1>
          <p className="text-slate-500 mt-1">Tu plataforma interactiva de normalización de bases de datos</p>
        </div>

        {/* XP Progress Bar */}
        {isAuthenticated && user && (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {user.rango || 'Aprendiz'}
              </span>
              <span className="text-xs font-bold text-indigo-600">{xp} XP</span>
            </div>
            <div className="progress-bar">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 animate-xp-fill"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-right">
              {Math.round(xpToNextLevel - (xp % xpToNextLevel))} XP para el siguiente nivel
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s) => (
            <div key={s.label} className="stat-card animate-fade-in card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-lg`}>
                  {s.icon}
                </div>
                <span className={`badge ${s.bg} ${s.text}`}>
                  {isAuthenticated ? '↑ 0%' : '—'}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))
        }
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" /> Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa) => (
            <button
              key={qa.view}
              onClick={() => onNavigate(qa.view)}
              className="text-left p-5 rounded-xl bg-white border border-slate-200 card-hover group transition-all hover:border-indigo-200"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${qa.gradient} flex items-center justify-center text-xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                {qa.icon}
              </div>
              <p className="font-semibold text-slate-800 text-sm">{qa.label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{qa.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                Ir ahora <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            📋 Actividad Reciente
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 stagger">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors animate-fade-in group cursor-default">
                  <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center text-sm flex-shrink-0`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{a.action}</p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mastery */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            📈 Tu Dominio
          </h2>
          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3.5 rounded w-3/4" />
                  <div className="skeleton h-2 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mastery.map((m) => (
                <div key={m.concept}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600">{m.concept}</span>
                    <span className="text-xs font-bold text-slate-800">{m.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`bg-gradient-to-r ${m.color} animate-xp-fill`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => onNavigate('normalization')}
            className="mt-5 w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all btn-glow flex items-center justify-center gap-2"
          >
            Practicar ahora <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
