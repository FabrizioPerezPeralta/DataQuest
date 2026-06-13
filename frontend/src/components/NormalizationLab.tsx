// NormalizationLab.tsx — Con Spinner real, confetti en BCNF y toasts
import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Zap, BookOpen, HelpCircle } from 'lucide-react';
import { useSchemaStore } from '../store/schemaStore';
import { validateSchema } from '../services/api';
import { DiagnosisPanel } from './DiagnosisPanel';
import { useAuthStore } from '../store/authStore';
import { toast } from './Toast';
import { useConfetti } from '../hooks/useConfetti';
import type { FunctionalDependency, ValidationResponse } from '../types';

export const NormalizationLab: React.FC = () => {
  const [tableName, setTableName] = useState('Estudiante');
  const [attributes, setAttributes] = useState(['id_est', 'nombre', 'ciudad']);
  const [dependencies, setDependencies] = useState<FunctionalDependency[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const { setCurrentSchema } = useSchemaStore();
  const { user, setUser, token } = useAuthStore();
  const { fireConfetti, fireSuccess } = useConfetti();

  const [newAttr, setNewAttr] = useState('');
  const [attrError, setAttrError] = useState('');
  const [newDet, setNewDet] = useState('');
  const [newDep, setNewDep] = useState('');
  const [depError, setDepError] = useState('');

  const handleAddAttribute = () => {
    const val = newAttr.trim();
    if (!val) return;
    if (attributes.includes(val)) { setAttrError('El atributo ya existe'); return; }
    setAttributes([...attributes, val]);
    setNewAttr('');
    setAttrError('');
  };

  const handleAddDependency = () => {
    const det = newDet.split(',').map(s => s.trim()).filter(Boolean);
    const dep = newDep.split(',').map(s => s.trim()).filter(Boolean);
    if (det.length === 0 || dep.length === 0) { setDepError('Ingresa al menos un atributo en cada campo'); return; }
    const exists = dependencies.some(d =>
      JSON.stringify(d.determinant) === JSON.stringify(det) &&
      JSON.stringify(d.dependent) === JSON.stringify(dep)
    );
    if (exists) { setDepError('Esta dependencia ya existe'); return; }
    setDependencies([...dependencies, { determinant: det, dependent: dep }]);
    setNewDet(''); setNewDep(''); setDepError('');
  };

  const handleValidate = async () => {
    if (attributes.length === 0) { toast.warning('Agrega al menos un atributo primero'); return; }
    const schema = { table_name: tableName, attributes, dependencies };
    setIsValidating(true);
    setCurrentSchema(schema);
    try {
      const response = await validateSchema(schema);
      setValidation(response);

      const nf = response.data?.diagnosis?.current_nf;
      const isFullyNormalized = response.data?.is_fully_normalized;

      if (isFullyNormalized && nf === 'BCNF') {
        fireConfetti();
        toast.success('¡Felicidades! Esquema en BCNF. ¡Datos perfectamente normalizados! 🎉');
      } else if (isFullyNormalized) {
        fireSuccess();
        toast.success(`¡Esquema normalizado hasta ${nf}!`);
      } else {
        toast.info(`Diagnóstico completado: ${nf}. Revisa las violaciones detectadas.`);
      }

      if (response.gamification && user && token) {
        setUser({ ...user, xp: response.gamification.xp_total, rango: response.gamification.rango_actual }, token);
        toast.success(`+10 XP ganados → ${response.gamification.rango_actual} ⭐`);
      }
    } catch {
      toast.error('¡Vaya! No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    } finally {
      setIsValidating(false);
    }
  };

  const nfLabel = validation?.data?.diagnosis?.current_nf ?? '—';
  const isNormalized = validation?.data?.is_fully_normalized;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔧 Motor de Normalización</h1>
          <p className="text-slate-500 mt-1">Define un esquema relacional y analiza su nivel de normalización</p>
        </div>
        {validation && (
          <div className={`px-5 py-2 rounded-xl font-bold text-lg shadow-md ${
            isNormalized ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
          }`}>
            {nfLabel}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Schema Builder */}
        <div className="lg:col-span-3 space-y-5">
          {/* Table Name */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Tabla</label>
            <input
              type="text"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              placeholder="ej: Estudiante"
            />
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Atributos</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
              {attributes.map((attr, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-mono font-medium border border-indigo-100 group">
                  {attr}
                  <button
                    onClick={() => setAttributes(attributes.filter((_, i) => i !== idx))}
                    className="text-indigo-300 hover:text-red-500 transition-colors ml-0.5 group-hover:scale-110"
                  >×</button>
                </span>
              ))}
              {attributes.length === 0 && <p className="text-xs text-slate-400 italic self-center">Sin atributos definidos</p>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAttr}
                onChange={e => { setNewAttr(e.target.value); setAttrError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAddAttribute()}
                placeholder="Nombre del atributo"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button onClick={handleAddAttribute} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors active:scale-95">
                + Agregar
              </button>
            </div>
            {attrError && <p className="text-xs text-red-500 mt-1.5">{attrError}</p>}
          </div>

          {/* Functional Dependencies */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">Dependencias Funcionales</label>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {dependencies.length} definida{dependencies.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {dependencies.map((dep, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  validation?.data?.diagnosis?.violations?.length
                    ? 'bg-red-50/50 border-red-100 animate-pulse-soft'
                    : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-sm font-mono">
                    <span className="text-violet-600 font-semibold">{'{' + dep.determinant.join(', ') + '}'}</span>
                    <span className="text-slate-400 mx-2">→</span>
                    <span className="text-emerald-600 font-semibold">{'{' + dep.dependent.join(', ') + '}'}</span>
                  </span>
                  <button onClick={() => setDependencies(dependencies.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors ml-2">✕</button>
                </div>
              ))}
              {dependencies.length === 0 && <p className="text-xs text-slate-400 italic p-2">Sin dependencias definidas</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={newDet}
                onChange={e => { setNewDet(e.target.value); setDepError(''); }}
                placeholder="Determinante (ej: id_est)"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              />
              <input
                type="text"
                value={newDep}
                onChange={e => { setNewDep(e.target.value); setDepError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAddDependency()}
                placeholder="Dependiente (ej: nombre,apellido)"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <button onClick={handleAddDependency} className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all active:scale-95">
              + Agregar Dependencia
            </button>
            {depError && <p className="text-xs text-red-500 mt-1.5">{depError}</p>}
          </div>
        </div>

        {/* Right: Validation & Diagnosis */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tip card */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex gap-2.5">
              <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700 leading-relaxed">
                {!validation
                  ? 'Define los atributos y dependencias funcionales, luego valida tu esquema para recibir diagnóstico interactivo.'
                  : validation.data?.diagnosis?.violations?.includes('2FN')
                  ? '🔍 Pista: ¿Algún atributo no clave depende solo de parte de la clave primaria?'
                  : validation.data?.diagnosis?.violations?.includes('3FN')
                  ? '🧠 Codd: Los atributos no clave no deben depender de otros atributos no clave.'
                  : '✅ ¡Esquema completamente normalizado!'
                }
              </p>
            </div>
          </div>

          {/* Validate Button */}
          <button
            id="validate-btn"
            onClick={handleValidate}
            disabled={isValidating || attributes.length === 0}
            className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 relative overflow-hidden group"
            style={{
              background: isValidating
                ? 'rgba(99,102,241,0.6)'
                : 'linear-gradient(135deg, #4F46E5, #2563EB)',
              boxShadow: isValidating ? 'none' : '0 4px 20px rgba(79,70,229,0.45), 0 0 0 0 rgba(79,70,229,0.4)',
            }}
          >
            {/* Glow effect on hover */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))' }} />

            {isValidating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analizando esquema...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Validar Normalización</span>
              </>
            )}
          </button>

          {/* Result Badge */}
          {validation && (
            <>
              <div className={`p-4 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2 ${
                isNormalized
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isNormalized
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <AlertTriangle className="w-4 h-4" />}
                {validation.data?.message}
              </div>
              <DiagnosisPanel diagnosis={validation.data?.diagnosis} />
            </>
          )}

          {/* Mission Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Misión Actual
            </h4>
            <p className="text-xs text-slate-500 mt-1">Alcanza BCNF para liberar los datos de anomalías</p>
            <div className="mt-3">
              <div className="progress-bar">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-700"
                  style={{ width: nfLabel === 'BCNF' ? '100%' : nfLabel === '3FN' ? '75%' : nfLabel === '2NF' ? '50%' : nfLabel === '1NF' ? '25%' : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
