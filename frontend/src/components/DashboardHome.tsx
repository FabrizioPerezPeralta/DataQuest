import React, { useEffect, useState } from 'react';
import type { ViewType } from '../types';
import { getUserStats } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Props {
  onNavigate: (view: ViewType) => void;
}

const quickActions: { icon: string; label: string; desc: string; view: ViewType; gradient: string }[] = [
  { icon: '🔧', label: 'Normalizar Datos',  desc: 'Analiza un esquema paso a paso',   view: 'normalization', gradient: 'from-indigo-500 to-blue-600' },
  { icon: '🗺️', label: 'Iniciar DataQuest', desc: 'Misiones de aprendizaje guiadas',  view: 'dataquest',     gradient: 'from-violet-500 to-purple-600' },
  { icon: '🎮', label: 'Jugar un Puzzle',   desc: 'Pon a prueba lo que aprendiste',    view: 'games',         gradient: 'from-emerald-500 to-teal-600' },
  { icon: '🏆', label: 'Ver Ranking',       desc: 'Compara tu progreso con otros',     view: 'leaderboard',   gradient: 'from-amber-500 to-orange-600' },
];

const mastery = [
  { concept: '1FN — Atomicidad',            pct: 95 },
  { concept: '2FN — Dep. Parciales',        pct: 78 },
  { concept: '3FN — Dep. Transitivas',      pct: 62 },
  { concept: 'BCNF — Determinantes Clave',  pct: 40 },
  { concept: 'Dependencias Funcionales',    pct: 85 },
];

export const DashboardHome: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [xp, setXp] = useState(1250);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // 1. Get local validations count from history
    try {
      const stored = localStorage.getItem('dataquest_normalization_history');
      const historyList = stored ? JSON.parse(stored) : [];
      setValidatedCount(historyList.length);
    } catch {
      setValidatedCount(0);
    }

    // 2. Fetch stats from API
    if (user && user.correo !== 'invitado@dataquest.edu') {
      getUserStats()
        .then((data) => {
          if (data) {
            setXp(data.xp || 0);
            setLevelsCompleted(data.levels_completed || 0);
            setPuzzlesSolved(data.puzzles_solved || 0);

            // Map backend activity logs
            const backendActs = (data.recent_activity || []).map((act: any) => ({
              action: act.mensaje,
              time: 'Completado',
              icon: '🏆',
              color: 'bg-indigo-100 text-indigo-700'
            }));

            // Map local validation logs
            const stored = localStorage.getItem('dataquest_normalization_history');
            const historyList = stored ? JSON.parse(stored) : [];
            const localActs = historyList.map((item: any) => ({
              action: `Validaste esquema "${item.tableName}" (${item.resultNf})`,
              time: item.timestamp,
              icon: '✅',
              color: 'bg-emerald-100 text-emerald-700'
            }));

            const combined = [...localActs, ...backendActs].slice(0, 8);
            setActivities(combined.length > 0 ? combined : [
              { action: 'Sesión activa. ¡Empieza a normalizar para ver tu historial!', time: 'Ahora', icon: '🎓', color: 'bg-indigo-100 text-indigo-700' }
            ]);
          }
        })
        .catch(() => {
          // Fallback on error
          loadLocalOnlyActivity();
        });
    } else {
      // Guest or local mode
      loadLocalOnlyActivity();
    }
  }, [user]);

  const loadLocalOnlyActivity = () => {
    const stored = localStorage.getItem('dataquest_normalization_history');
    const historyList = stored ? JSON.parse(stored) : [];
    const localActs = historyList.map((item: any) => ({
      action: `Validaste esquema "${item.tableName}" (${item.resultNf})`,
      time: item.timestamp,
      icon: '✅',
      color: 'bg-emerald-100 text-emerald-700'
    }));

    if (localActs.length > 0) {
      setActivities(localActs.slice(0, 8));
    } else {
      setActivities([
        { action: 'Ingresaste como Invitado. Tus actividades y esquemas locales se listarán aquí.', time: 'Reciente', icon: '👤', color: 'bg-blue-100 text-blue-700' }
      ]);
    }
    setXp(0);
    setLevelsCompleted(0);
    setPuzzlesSolved(0);
  };

  const stats = [
    { icon: '📋', label: 'Esquemas Validados', value: validatedCount, color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { icon: '🧩', label: 'Puzzles Resueltos',  value: puzzlesSolved, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { icon: '🏆', label: 'Niveles Completados',  value: levelsCompleted,  color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
    { icon: '⭐', label: 'XP acumulado',            value: xp, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bienvenido a DataQuest, {user?.apodo || 'Invitado'} 🎓</h1>
        <p className="text-slate-500 mt-1 font-medium">Tu plataforma interactiva de normalización de bases de datos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {stats.map((s) => (
          <div key={s.label} className="stat-card animate-fade-in card-hover bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-lg`}>
                {s.icon}
              </div>
              <span className={`badge ${s.bg} ${s.text} text-xs font-bold px-2 py-0.5 rounded-full`}>Activo</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">⚡ Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa) => (
            <button
              key={qa.view}
              onClick={() => onNavigate(qa.view)}
              className="text-left p-4 rounded-xl bg-white border border-slate-200 card-hover group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${qa.gradient} flex items-center justify-center text-xl mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                {qa.icon}
              </div>
              <p className="font-semibold text-slate-800 text-sm">{qa.label}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{qa.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">📋 Historial y Actividad Reciente</h2>
          <div className="space-y-3 stagger max-h-96 overflow-y-auto pr-1">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all animate-fade-in">
                <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center text-sm flex-shrink-0`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{a.action}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mastery */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">📈 Tu Dominio</h2>
          <div className="space-y-4">
            {mastery.map((m) => (
              <div key={m.concept}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">{m.concept}</span>
                  <span className="text-xs font-bold text-slate-800">{m.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${m.pct >= 80 ? 'bg-emerald-500' : m.pct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('normalization')}
            className="mt-5 w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            Practicar ahora →
          </button>
        </div>
      </div>
    </div>
  );
};
