import React from 'react';

const players = [
  { rank: 1, apodo: 'MasterSQL', xp: 5420, medallas: ['🥇', '🛡️', '🎓'], status: 'online' },
  { rank: 2, apodo: 'DataWizard', xp: 4850, medallas: ['🥈', '🎓'], status: 'offline' },
  { rank: 3, apodo: 'NormiHero', xp: 4210, medallas: ['🥉', '🛡️'], status: 'online' },
  { rank: 4, apodo: 'AdminUser', xp: 3900, medallas: ['🎓'], status: 'offline' },
  { rank: 5, apodo: 'Student42', xp: 2150, medallas: [], status: 'online' },
];

export const LeaderboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏆 Salón de la Fama</h1>
          <p className="text-slate-500 mt-1">Los mejores normalizadores de la plataforma.</p>
        </div>
        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
          <button className="px-4 py-1.5 rounded-lg text-sm font-bold bg-slate-100 text-slate-900">Global</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Semanal</button>
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
        {[players[1], players[0], players[2]].map((p) => (
          <div key={p.apodo} className={`bg-white rounded-2xl border border-slate-200 p-6 text-center animate-scale-in flex flex-col items-center ${
            p.rank === 1 ? 'order-2 h-72 border-indigo-200 ring-4 ring-indigo-50 shadow-xl' : 
            p.rank === 2 ? 'order-1 h-64 shadow-lg' : 'order-3 h-56 shadow-md'
          }`}>
            <div className="relative mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                p.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-600 scale-125' : 
                p.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 
                'bg-gradient-to-br from-orange-400 to-orange-600'
              }`}>
                {p.rank}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${p.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{p.apodo}</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-4">{p.rank === 1 ? 'Maestro Supremo' : 'Estratega'}</p>
            <div className="mt-auto">
              <p className="text-2xl font-black text-indigo-600 leading-none">{p.xp}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">XP ACUMULADO</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Usuario</div>
          <div className="col-span-2 text-center">Medallas</div>
          <div className="col-span-3 text-right">XP Total</div>
        </div>
        <div className="divide-y divide-slate-100 stagger">
          {players.map((p) => (
            <div key={p.apodo} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 transition-colors animate-fade-in group">
              <div className="col-span-1 font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">#{p.rank}</div>
              <div className="col-span-6 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  p.rank === 1 ? 'bg-amber-400' : p.rank === 2 ? 'bg-slate-400' : p.rank === 3 ? 'bg-orange-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {p.apodo.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-700">{p.apodo}</span>
                {p.status === 'online' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
              </div>
              <div className="col-span-2 text-center flex justify-center gap-1">
                {p.medallas.map((m, i) => <span key={i} className="text-sm" title="Medalla">{m}</span>)}
                {p.medallas.length === 0 && <span className="text-slate-300 text-xs">—</span>}
              </div>
              <div className="col-span-3 text-right font-bold text-slate-900">{p.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
