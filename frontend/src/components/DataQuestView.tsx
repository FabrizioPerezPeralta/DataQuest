import React from 'react';

const missions = [
  { id: 1, title: 'La Ciudad de los Atributos', desc: 'Aprende a identificar atributos atómicos y compuestos.', xp: 100, difficulty: 'Fácil', status: 'completed' },
  { id: 2, title: 'El Puente de las Dependencias', desc: 'Domina las dependencias funcionales básicas.', xp: 250, difficulty: 'Medio', status: 'active' },
  { id: 3, title: 'La Fortaleza de la 2FN', desc: 'Elimina las dependencias parciales del reino.', xp: 400, difficulty: 'Difícil', status: 'locked' },
  { id: 4, title: 'El Santuario de la 3FN', desc: 'Purifica las tablas de dependencias transitivas.', xp: 600, difficulty: 'Muy Difícil', status: 'locked' },
];

export const DataQuestView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">🗺️ DataQuest: El Camino del Maestro</h1>
        <p className="text-slate-500 mt-1">Completa misiones para dominar el arte de la normalización.</p>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-200 z-0"></div>
        <div className="space-y-12 relative z-10">
          {missions.map((m) => (
            <div key={m.id} className={`flex items-start gap-8 animate-fade-in ${m.status === 'locked' ? 'opacity-60' : ''}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg flex-shrink-0 ${
                m.status === 'completed' ? 'bg-emerald-500 text-white' : 
                m.status === 'active' ? 'bg-indigo-500 text-white ring-4 ring-indigo-200' : 
                'bg-slate-300 text-slate-500'
              }`}>
                {m.status === 'completed' ? '✓' : m.id}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 card-hover">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800">{m.title}</h3>
                  <span className={`badge ${
                    m.difficulty === 'Fácil' ? 'bg-emerald-100 text-emerald-700' : 
                    m.difficulty === 'Medio' ? 'bg-indigo-100 text-indigo-700' : 
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {m.difficulty}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">{m.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-amber-600">⭐ {m.xp} XP</span>
                    {m.status === 'completed' && <span className="text-xs text-emerald-600 font-bold">Completado</span>}
                  </div>
                  <button 
                    disabled={m.status === 'locked'}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                      m.status === 'completed' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' :
                      m.status === 'active' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' :
                      'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {m.status === 'completed' ? 'Repetir' : m.status === 'active' ? 'Iniciar Misión' : 'Bloqueado'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
