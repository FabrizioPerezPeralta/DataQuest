import React from 'react';
import type { DidacticDiagnosis } from '../types';

interface DiagnosisPanelProps {
  diagnosis: DidacticDiagnosis;
}

export const DiagnosisPanel: React.FC<DiagnosisPanelProps> = ({ diagnosis }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 max-h-[32rem] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">📊 Diagnóstico</h3>
        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
          {diagnosis.current_nf}
        </span>
      </div>

      {/* Violations */}
      {diagnosis.violations.length > 0 && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <p className="text-xs font-semibold text-red-700 mb-1">Violaciones detectadas:</p>
          <div className="flex gap-2">
            {diagnosis.violations.map((v, i) => (
              <span key={i} className="badge bg-red-100 text-red-700">{v}</span>
            ))}
          </div>
        </div>
      )}

      {/* Didactic Steps */}
      {diagnosis.didactic_steps.map((step, idx) => (
        <div key={idx} className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg space-y-1.5">
          <p className="text-xs font-semibold text-slate-800">{step.step}</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">{step.explanation}</p>
          <p className="text-[11px] italic text-slate-500">"{step.rule_codd}"</p>
          <details className="mt-1">
            <summary className="cursor-pointer text-indigo-600 text-[11px] font-medium hover:underline">
              Ver detalle técnico
            </summary>
            <pre className="text-[11px] mt-1.5 whitespace-pre-wrap bg-white p-2 rounded-lg border border-slate-100 text-slate-700">
              {step.violation_detail}
            </pre>
          </details>
        </div>
      ))}

      {/* Suggestions */}
      {diagnosis.suggestions.length > 0 && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
          <p className="text-xs font-semibold text-emerald-700 mb-1">💡 Sugerencias:</p>
          <ul className="list-disc ml-4 space-y-0.5">
            {diagnosis.suggestions.map((s, i) => (
              <li key={i} className="text-[11px] text-slate-700">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
