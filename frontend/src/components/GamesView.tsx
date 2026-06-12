import React from 'react';

const puzzles = [
  { id: 1, title: 'El Caso del Estudiante Duplicado', difficulty: 1, xp: 50, type: 'Puzzle' },
  { id: 2, title: 'Inventarios Infinitos', difficulty: 2, xp: 120, type: 'Puzzle' },
  { id: 3, title: 'Pedidos Fantasmas', difficulty: 4, xp: 300, type: 'Reto Semanal' },
];

export const GamesView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎮 Juegos y Retos de Aprendizaje</h1>
          <p className="text-slate-500 mt-1">Pon a prueba tus conocimientos con desafíos interactivos.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold">Puzzles: 12/50</span>
          <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">Retos: 2/5</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puzzles.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover flex flex-col">
            <div className={`h-32 flex items-center justify-center text-5xl bg-gradient-to-br ${
              p.type === 'Reto Semanal' ? 'from-amber-400 to-orange-500' : 'from-indigo-400 to-blue-500'
            }`}>
              {p.type === 'Reto Semanal' ? '🏆' : '🧩'}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  p.type === 'Reto Semanal' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {p.type}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < p.difficulty ? 'text-amber-500' : 'text-slate-200'}`}>★</span>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{p.title}</h3>
              <p className="text-sm text-slate-500 mb-6">Resuelve este esquema para ganar recompensas únicas.</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">⭐ {p.xp} XP</span>
                <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all">
                  Jugar
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty Slot / Coming Soon */}
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center opacity-60">
          <span className="text-4xl mb-3">🔒</span>
          <p className="text-sm font-bold text-slate-500">Próximamente</p>
          <p className="text-xs text-slate-400 mt-1">Nuevos retos cada lunes</p>
        </div>
      </div>
    </div>
  );
};
