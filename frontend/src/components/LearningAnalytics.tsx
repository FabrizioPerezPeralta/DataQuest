// LearningAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getUserMastery } from '../services/api';
import type { MasteryConcept } from '../types';

const DEFAULT_MASTERY: MasteryConcept[] = [
  { concept: '1FN', percentage: 0, mastered: false },
  { concept: '2FN', percentage: 0, mastered: false },
  { concept: '3FN', percentage: 0, mastered: false },
  { concept: 'BCNF', percentage: 0, mastered: false },
  { concept: 'DF', percentage: 0, mastered: false },
];

export const LearningAnalytics: React.FC = () => {
  const [mastery, setMastery] = useState<MasteryConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (!user) {
      // Sin usuario autenticado: mostrar datos vacíos sin quedarse en loading
      setMastery(DEFAULT_MASTERY);
      setLoading(false);
      return;
    }
    getUserMastery(user.id)
      .then(setMastery)
      .catch((err) => {
        console.error('Error cargando analítica:', err);
        setMastery(DEFAULT_MASTERY);
      })
      .finally(() => setLoading(false));
  }, [user]);
  
  if (loading) {
    return <div className="text-center py-4">Cargando analítica...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">📈 Tu Dominio de Normalización</h2>
      <div className="space-y-4">
        {mastery.map((concept) => (
          <div key={concept.concept}>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-sm">{concept.concept}</span>
              <span className={concept.mastered ? 'text-green-600 text-xs' : 'text-orange-500 text-xs'}>
                {concept.mastered ? '✅ Dominado' : '⚠️ Reforzar'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${concept.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{concept.percentage}% de aciertos</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-sm">🎯 Recomendación personalizada</h3>
        <p className="text-xs mt-2">
          {mastery.find(m => m.concept === '3FN' && !m.mastered) 
            ? "Concéntrate en ejercicios de dependencias transitivas. Usa la misión 'Elimina la cadena'."
            : mastery.find(m => !m.mastered)
            ? "Sigue practicando para dominar todos los conceptos."
            : "¡Vas excelente! Prueba el reto semanal BCNF para convertirte en Maestro de Datos."}
        </p>
      </div>
    </div>
  );
};
