import React, { useState } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { validateSchema } from '../services/api';
import { DiagnosisPanel } from './DiagnosisPanel';
import type { FunctionalDependency, ValidationResponse } from '../types';

interface DecomposedTable {
  name: string;
  attributes: string[];
  primary_key: string[];
}

interface NormalizationHistoryItem {
  id: string;
  tableName: string;
  attributes: string[];
  dependencies: FunctionalDependency[];
  resultNf: string;
  timestamp: string;
}

const EXAMPLES = [
  {
    name: '📚 2FN (Matrícula - Dependencia Parcial)',
    tableName: 'Matricula',
    attributes: ['id_estudiante', 'id_curso', 'nombre_estudiante', 'nombre_curso', 'nota'],
    dependencies: [
      { determinant: ['id_estudiante'], dependent: ['nombre_estudiante'] },
      { determinant: ['id_curso'], dependent: ['nombre_curso'] },
      { determinant: ['id_estudiante', 'id_curso'], dependent: ['nota'] }
    ],
    desc: 'Los nombres dependen parcialmente de los IDs individuales, no de la clave compuesta.'
  },
  {
    name: '🏢 3FN (Empleados - Dependencia Transitiva)',
    tableName: 'EmpleadoDep',
    attributes: ['id_empleado', 'nombre', 'id_departamento', 'nombre_departamento', 'salario'],
    dependencies: [
      { determinant: ['id_empleado'], dependent: ['nombre', 'id_departamento', 'salario'] },
      { determinant: ['id_departamento'], dependent: ['nombre_departamento'] }
    ],
    desc: 'El nombre del departamento depende de su ID, que a su vez depende del ID del empleado.'
  },
  {
    name: '🧠 FNBC (Reservas de Tutorías)',
    tableName: 'ReservaTutor',
    attributes: ['estudiante', 'tutor', 'materia'],
    dependencies: [
      { determinant: ['estudiante', 'materia'], dependent: ['tutor'] },
      { determinant: ['tutor'], dependent: ['materia'] }
    ],
    desc: 'El tutor determina la materia, pero tutor no es una clave candidata.'
  }
];

export const NormalizationLab: React.FC = () => {
  const [tableName, setTableName] = useState('Estudiante');
  const [attributes, setAttributes] = useState(['id_est', 'nombre', 'ciudad']);
  const [dependencies, setDependencies] = useState<FunctionalDependency[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setCurrentSchema } = useSchemaStore();

  // Local validation history loaded from localStorage
  const [history, setHistory] = useState<NormalizationHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('dataquest_normalization_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Mode: Visual Builder vs SQL Text Importer
  const [inputMode, setInputMode] = useState<'visual' | 'text'>('visual');
  const [pastedText, setPastedText] = useState('');
  
  // Right results panel states
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'tables' | 'erd'>('diagnosis');
  const [targetNf, setTargetNf] = useState<'1FN' | '2FN' | '3FN' | 'BCNF'>('BCNF');

  // Inline inputs for Visual Builder
  const [newAttr, setNewAttr] = useState('');
  const [attrError, setAttrError] = useState('');
  const [newDet, setNewDet] = useState('');
  const [newDep, setNewDep] = useState('');
  const [depError, setDepError] = useState('');

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setTableName(ex.tableName);
    setAttributes(ex.attributes);
    setDependencies(ex.dependencies);
    setValidation(null);
    setErrorMessage(null);
  };

  const handleAddAttribute = () => {
    const val = newAttr.trim();
    if (!val) return;
    if (attributes.includes(val)) {
      setAttrError('El atributo ya existe');
      return;
    }
    setAttributes([...attributes, val]);
    setNewAttr('');
    setAttrError('');
  };

  const handleAddDependency = () => {
    const det = newDet.split(',').map(s => s.trim()).filter(Boolean);
    const dep = newDep.split(',').map(s => s.trim()).filter(Boolean);
    if (det.length === 0 || dep.length === 0) {
      setDepError('Ingresa al menos un atributo en cada campo');
      return;
    }
    const exists = dependencies.some(d =>
      JSON.stringify(d.determinant) === JSON.stringify(det) &&
      JSON.stringify(d.dependent) === JSON.stringify(dep)
    );
    if (exists) {
      setDepError('Esta dependencia ya existe');
      return;
    }
    setDependencies([...dependencies, { determinant: det, dependent: dep }]);
    setNewDet('');
    setNewDep('');
    setDepError('');
  };

  // Algorithms for step-by-step normalizations
  const decomposeTo1FN = (tName: string, attrs: string[], keys: string[][]): DecomposedTable[] => {
    return [{
      name: tName,
      attributes: attrs,
      primary_key: keys[0] || []
    }];
  };

  const decomposeTo2FN = (tName: string, attrs: string[], keys: string[][], fds: FunctionalDependency[]): DecomposedTable[] => {
    const pk = keys[0] || [];
    if (pk.length <= 1) {
      return decomposeTo1FN(tName, attrs, keys);
    }

    const primeAttributes = new Set(keys.flat());
    const nonPrimeAttributes = attrs.filter(a => !primeAttributes.has(a));

    const partialDeps: FunctionalDependency[] = [];
    fds.forEach(dep => {
      const isLhsSubsetOfPk = dep.determinant.every(attr => pk.includes(attr)) && dep.determinant.length < pk.length;
      const hasNonPrimeRhs = dep.dependent.some(attr => nonPrimeAttributes.includes(attr));
      if (isLhsSubsetOfPk && hasNonPrimeRhs) {
        partialDeps.push(dep);
      }
    });

    if (partialDeps.length === 0) {
      return decomposeTo1FN(tName, attrs, keys);
    }

    const tables: DecomposedTable[] = [];
    const assignedNonPrimes = new Set<string>();

    partialDeps.forEach((dep, idx) => {
      const tableAttrs = Array.from(new Set([...dep.determinant, ...dep.dependent]));
      tables.push({
        name: `${tName}_2FN_Sub_${idx + 1}`,
        attributes: tableAttrs,
        primary_key: dep.determinant
      });
      dep.dependent.forEach(attr => assignedNonPrimes.add(attr));
    });

    const mainAttrs = attrs.filter(attr => !assignedNonPrimes.has(attr) || pk.includes(attr));
    tables.unshift({
      name: `${tName}_2FN_Principal`,
      attributes: mainAttrs,
      primary_key: pk
    });

    return tables;
  };

  const decomposeTo3FN = (tName: string, attrs: string[], keys: string[][], fds: FunctionalDependency[]): DecomposedTable[] => {
    if (fds.length === 0) {
      return decomposeTo1FN(tName, attrs, keys);
    }

    const pk = keys[0] || [];
    const tables: DecomposedTable[] = [];

    fds.forEach((dep, idx) => {
      const tableAttrs = Array.from(new Set([...dep.determinant, ...dep.dependent]));
      tables.push({
        name: `${tName}_3FN_Sub_${idx + 1}`,
        attributes: tableAttrs,
        primary_key: dep.determinant
      });
    });

    const hasKey = tables.some(t => {
      return keys.some(key => key.every(attr => t.attributes.includes(attr)));
    });

    if (!hasKey && pk.length > 0) {
      tables.push({
        name: `${tName}_3FN_Clave`,
        attributes: pk,
        primary_key: pk
      });
    }

    const filteredTables: DecomposedTable[] = [];
    for (let i = 0; i < tables.length; i++) {
      let isSubset = false;
      for (let j = 0; j < tables.length; j++) {
        if (i !== j) {
          const tI = tables[i];
          const tJ = tables[j];
          const allInJ = tI.attributes.every(attr => tJ.attributes.includes(attr));
          if (allInJ && (tJ.attributes.length > tI.attributes.length || j < i)) {
            isSubset = true;
            break;
          }
        }
      }
      if (!isSubset) {
        filteredTables.push(tables[i]);
      }
    }

    return filteredTables;
  };

  const parseInputText = (text: string) => {
    let table = 'TablaImportada';
    const attrsSet = new Set<string>();
    const fds: FunctionalDependency[] = [];

    const createTableRegex = /create\s+table\s+(\w+)/i;
    const tableLabelRegex = /table:\s*(\w+)/i;
    const match = text.match(createTableRegex) || text.match(tableLabelRegex);
    if (match) {
      table = match[1];
    }

    const bodyStart = text.indexOf('(');
    const bodyEnd = text.lastIndexOf(')');
    if (bodyStart !== -1 && bodyEnd !== -1 && bodyEnd > bodyStart) {
      const body = text.substring(bodyStart + 1, bodyEnd);
      const lines = body.split(',');
      lines.forEach(line => {
        const clean = line.trim();
        if (!clean) return;
        
        if (clean.toUpperCase().startsWith('PRIMARY KEY')) {
          const pkMatch = clean.match(/primary\s+key\s*\(([^)]+)\)/i);
          if (pkMatch) {
            const pkCols = pkMatch[1].split(',').map(s => s.trim().replace(/[`"']/g, ''));
            pkCols.forEach(col => attrsSet.add(col));
          }
          return;
        }
        if (clean.toUpperCase().startsWith('CONSTRAINT') || clean.toUpperCase().startsWith('FOREIGN KEY')) {
          return;
        }

        const tokens = clean.split(/\s+/);
        const colName = tokens[0].replace(/[`"']/g, '');
        if (colName && !/^(create|table|select|insert|update|delete|drop|alter)$/i.test(colName)) {
          attrsSet.add(colName);
        }
      });
    }

    const fdLines = text.split('\n');
    fdLines.forEach(line => {
      if (line.includes('->') || line.includes('→')) {
        const parts = line.split(/->|→/);
        if (parts.length === 2) {
          const det = parts[0].replace(/[-#\-*()/]/g, '').split(',').map(s => s.trim()).filter(Boolean);
          const dep = parts[1].replace(/[-#\-*()/]/g, '').split(',').map(s => s.trim()).filter(Boolean);
          if (det.length > 0 && dep.length > 0) {
            fds.push({ determinant: det, dependent: dep });
            det.forEach(d => attrsSet.add(d));
            dep.forEach(d => attrsSet.add(d));
          }
        }
      }
    });

    if (attrsSet.size === 0) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes('attributes:') || line.toLowerCase().includes('atributos:')) {
          const cols = line.substring(line.indexOf(':') + 1).split(',').map(s => s.trim()).filter(Boolean);
          cols.forEach(c => attrsSet.add(c));
          break;
        }
      }
    }

    if (attrsSet.size === 0 && text.trim().length > 0) {
      const words = text.split(/[\s,]+/);
      words.forEach(w => {
        const cleanW = w.trim().replace(/[^a-zA-Z0-9_]/g, '');
        if (cleanW && cleanW.length > 1 && !/^(create|table|primary|key|varchar|int|null|char|double|float|text)$/i.test(cleanW)) {
          attrsSet.add(cleanW);
        }
      });
    }

    return {
      table,
      attributes: Array.from(attrsSet),
      dependencies: fds
    };
  };

  const handleImportText = () => {
    if (!pastedText.trim()) return;
    const parsed = parseInputText(pastedText);
    setTableName(parsed.table);
    setAttributes(parsed.attributes);
    setDependencies(parsed.dependencies);
    setValidation(null);
    setErrorMessage(null);
    setInputMode('visual');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setPastedText(text);
      const parsed = parseInputText(text);
      setTableName(parsed.table);
      setAttributes(parsed.attributes);
      setDependencies(parsed.dependencies);
      setValidation(null);
      setErrorMessage(null);
      setInputMode('visual');
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    const schema = { table_name: tableName, attributes, dependencies };
    setIsValidating(true);
    setErrorMessage(null);
    setCurrentSchema(schema);
    try {
      const response = await validateSchema(schema);
      setValidation(response);
      setTargetNf('BCNF');
      setActiveTab('diagnosis');

      // Append to local validation history
      const newHistoryItem: NormalizationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        tableName: schema.table_name,
        attributes: schema.attributes,
        dependencies: schema.dependencies,
        resultNf: response.data.diagnosis.current_nf,
        timestamp: new Date().toLocaleString()
      };
      // Prevent duplicate listings by filtering the existing history
      const updatedHistory = [newHistoryItem, ...history.filter(h => h.tableName !== schema.table_name)].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('dataquest_normalization_history', JSON.stringify(updatedHistory));
    } catch {
      setErrorMessage('No se pudo validar. Verifica que el backend esté funcionando.');
    } finally {
      setIsValidating(false);
    }
  };

  const loadHistoryItem = (item: NormalizationHistoryItem) => {
    setTableName(item.tableName);
    setAttributes(item.attributes);
    setDependencies(item.dependencies);
    setValidation(null);
    setErrorMessage(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('dataquest_normalization_history');
  };

  // Get active decomposed tables depending on selected normal form tab
  const getDecomposedTables = (): DecomposedTable[] => {
    if (!validation) return [];
    const keys = validation.data.candidate_keys || [];
    
    switch (targetNf) {
      case '1FN':
        return decomposeTo1FN(tableName, attributes, keys);
      case '2FN':
        return decomposeTo2FN(tableName, attributes, keys, dependencies);
      case '3FN':
        return decomposeTo3FN(tableName, attributes, keys, dependencies);
      case 'BCNF':
      default:
        return (validation.data.decomposed_tables || []).map(t => ({
          name: t.name,
          attributes: t.attributes,
          primary_key: t.primary_key
        }));
    }
  };

  const activeTables = getDecomposedTables();

  // Generate dynamic SQL for active tables
  const activeSql = activeTables.map(t => {
    let sql = `CREATE TABLE ${t.name} (\n`;
    t.attributes.forEach((attr, idx) => {
      const isPk = t.primary_key.includes(attr);
      sql += `  ${attr} VARCHAR(255)${isPk ? ' PRIMARY KEY' : ''}`;
      if (idx < t.attributes.length - 1) sql += ',';
      sql += '\n';
    });
    sql += ');';
    return sql;
  }).join('\n\n');

  // Generate dynamic Mermaid ERD code
  let activeMermaid = 'erDiagram\n';
  activeTables.forEach(t => {
    activeMermaid += `  ${t.name} {\n`;
    t.attributes.forEach(attr => {
      const isPk = t.primary_key.includes(attr);
      activeMermaid += `    string ${attr} ${isPk ? 'PK' : ''}\n`;
    });
    activeMermaid += `  }\n`;
  });
  activeTables.forEach((t, idx) => {
    activeTables.forEach((otherT, otherIdx) => {
      if (idx === otherIdx) return;
      const overlap = t.primary_key.filter(attr => otherT.attributes.includes(attr) && !otherT.primary_key.includes(attr));
      if (overlap.length > 0) {
        activeMermaid += `  ${t.name} ||--o{ ${otherT.name} : "referencia"\n`;
      }
    });
  });

  // Export functions
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsSQL = () => {
    downloadFile(activeSql, `${tableName}_normalized_${targetNf}.sql`, 'text/plain');
  };

  const exportAsMermaid = () => {
    downloadFile(activeMermaid, `${tableName}_normalized_${targetNf}.mmd`, 'text/plain');
  };

  const exportAsJSON = () => {
    const jsonContent = JSON.stringify({
      original_table: tableName,
      target_normal_form: targetNf,
      decomposed_tables: activeTables
    }, null, 2);
    downloadFile(jsonContent, `${tableName}_normalized_${targetNf}.json`, 'application/json');
  };

  const nfLabel = validation?.data.diagnosis.current_nf ?? '—';
  const isNormalized = validation?.data.is_fully_normalized;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔧 Validador de Normalización</h1>
          <p className="text-slate-500 mt-1">Normaliza interactivamente a 1FN, 2FN, 3FN o BCNF y visualiza el diagrama relacional dinámico</p>
        </div>
        {validation && (
          <div className={`px-4 py-2 rounded-xl font-bold text-lg ${isNormalized ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            Estado actual: {nfLabel}
          </div>
        )}
      </div>

      {/* Examples Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3">💡 Ejemplos de Prueba Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => loadExample(ex)}
              className="text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all card-hover group"
            >
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600">{ex.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{ex.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Input / Schema Builder */}
        <div className="lg:col-span-3 space-y-5">
          {/* Visual vs Text Input Mode Selector */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setInputMode('visual')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                inputMode === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛠️ Creador Visual
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                inputMode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 Pegar SQL DDL / Subir Archivo
            </button>
          </div>

          {inputMode === 'text' ? (
            /* Text/File Import Section */
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pegar DDL SQL o Texto de la Base de Datos</label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full h-48 px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder={`ej:\nCREATE TABLE Reserva (\n  id_estudiante INT,\n  id_tutor INT,\n  materia VARCHAR(100)\n);\n-- Dependencias:\n-- id_estudiante, materia -> id_tutor\n-- id_tutor -> materia`}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">O sube un archivo (.sql o .txt)</label>
                  <input
                    type="file"
                    accept=".sql,.txt"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                <button
                  onClick={handleImportText}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all self-end"
                >
                  Procesar e Importar
                </button>
              </div>
            </div>
          ) : (
            /* Visual Builder Section */
            <>
              {/* Table Name */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Tabla</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                  placeholder="ej: Matricula"
                />
              </div>

              {/* Attributes */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Atributos</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {attributes.map((attr, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-mono font-medium border border-indigo-100">
                      {attr}
                      <button
                        onClick={() => setAttributes(attributes.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-red-500 transition-colors ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {attributes.length === 0 && <p className="text-xs text-slate-400 italic">Sin atributos definidos</p>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAttr}
                    onChange={(e) => { setNewAttr(e.target.value); setAttrError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAttribute()}
                    placeholder="Nombre del atributo (ej: id_estudiante)"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button onClick={handleAddAttribute} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors">
                    + Agregar
                  </button>
                </div>
                {attrError && <p className="text-xs text-red-500 mt-1.5">{attrError}</p>}
              </div>

              {/* Functional Dependencies */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Dependencias Funcionales (DF)</label>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {dependencies.map((dep, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in">
                      <span className="text-sm font-mono">
                        <span className="text-indigo-600 font-bold">{'{' + dep.determinant.join(', ') + '}'}</span>
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="text-emerald-600 font-bold">{'{' + dep.dependent.join(', ') + '}'}</span>
                      </span>
                      <button onClick={() => setDependencies(dependencies.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors">
                        ✕
                      </button>
                    </div>
                  ))}
                  {dependencies.length === 0 && <p className="text-xs text-slate-400 italic p-2">Sin dependencias definidas</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={newDet}
                    onChange={(e) => { setNewDet(e.target.value); setDepError(''); }}
                    placeholder="Determinante (ej: id_estudiante)"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newDep}
                    onChange={(e) => { setNewDep(e.target.value); setDepError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDependency()}
                    placeholder="Dependiente (ej: nombre_estudiante)"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button onClick={handleAddDependency} className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                  + Agregar Dependencia Funcional
                </button>
                {depError && <p className="text-xs text-red-500 mt-1.5">{depError}</p>}
              </div>
            </>
          )}

          {/* Validation History Panel */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🕒</span> Historial de Esquemas Validados
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors font-semibold"
                >
                  Limpiar historial
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all text-xs font-mono flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-indigo-600 group-hover:text-indigo-800">{item.tableName}</span>
                      <span className="text-slate-400 ml-1.5">({item.resultNf})</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{item.timestamp}</span>
                    </div>
                    <span className="text-slate-300 group-hover:text-indigo-600 text-sm">➡️</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Validation Results & Diagrams */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tip */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-sm text-indigo-700">
              {!validation
                ? '💡 Define o importa un esquema y dependencias, luego presiona "Validar Normalización" para analizarlo.'
                : '✅ ¡Esquema analizado! Elige el nivel objetivo abajo para ver cómo se descompone y cómo cambia el diagrama relacional.'
              }
            </p>
          </div>

          {/* Validate Button */}
          <button
            onClick={handleValidate}
            disabled={isValidating || attributes.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md"
          >
            {isValidating ? '⏳ Validando con Algoritmos...' : '✓ Validar Normalización'}
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Result Tabs Panel */}
          {validation && (
            <div className="space-y-4">
              {/* TARGET NORMAL FORM LEVEL SELECTOR */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selecciona la Forma Normal Objetivo:
                </label>
                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                  {(['1FN', '2FN', '3FN', 'BCNF'] as const).map(nf => (
                    <button
                      key={nf}
                      onClick={() => setTargetNf(nf)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                        targetNf === nf ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {nf}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  {targetNf === '1FN' && '1FN: No hay atributos repetitivos, estructura de tabla única original.'}
                  {targetNf === '2FN' && '2FN: Remueve dependencias parciales en claves primarias compuestas.'}
                  {targetNf === '3FN' && '3FN: Aplica el algoritmo de síntesis para remover dependencias transitivas.'}
                  {targetNf === 'BCNF' && 'BCNF: Descomposición estricta donde cada determinante debe ser clave.'}
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab('diagnosis')}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                    activeTab === 'diagnosis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📋 Diagnóstico
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                    activeTab === 'tables' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🗄️ Tablas y SQL
                </button>
                <button
                  onClick={() => setActiveTab('erd')}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                    activeTab === 'erd' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📊 Diagrama BD
                </button>
              </div>

              {/* Status Header */}
              <div className={`p-4 rounded-xl text-center font-semibold text-sm ${isNormalized ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {validation.data.message}
              </div>

              {/* Active Tab rendering */}
              <div className="animate-fade-in" key={activeTab}>
                {activeTab === 'diagnosis' && (
                  <DiagnosisPanel diagnosis={validation.data.diagnosis} />
                )}

                {activeTab === 'tables' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tablas Generadas ({targetNf})</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={exportAsSQL}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition-all"
                          title="Descargar código SQL (.sql)"
                        >
                          💾 SQL
                        </button>
                        <button
                          onClick={exportAsJSON}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold transition-all"
                          title="Descargar esquema estructurado (.json)"
                        >
                          📋 JSON
                        </button>
                      </div>
                    </div>
                    {activeTables.map((table, i) => (
                      <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-sm text-indigo-600 flex items-center gap-1.5 mb-2.5">
                          <span>📋</span> {table.name}
                        </h4>
                        <div className="text-xs space-y-2">
                          <p>
                            <strong className="text-slate-600 block mb-0.5">Clave Primaria (PK):</strong>
                            <span className="font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded border border-indigo-100/50">
                              {table.primary_key.length > 0 ? table.primary_key.join(', ') : 'Ninguna'}
                            </span>
                          </p>
                          <p>
                            <strong className="text-slate-600 block mb-0.5">Atributos:</strong>
                            <span className="font-mono bg-slate-50 text-slate-700 px-2 py-1 rounded border border-slate-200/50 block leading-relaxed">
                              {table.attributes.join(', ')}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}

                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">SQL DDL correspondiente</h3>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <pre className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                        {activeSql}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'erd' && (
                  <div className="space-y-4">
                    {/* Visual Diagram Panel */}
                    <div className="space-y-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 relative min-h-[300px]">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Esquema Relacional ({targetNf})</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={exportAsMermaid}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-[9px] font-bold transition-all"
                            title="Descargar diagrama de Mermaid (.mmd)"
                          >
                            📊 Descargar ERD
                          </button>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                            {activeTables.length} {activeTables.length === 1 ? 'Tabla' : 'Tablas'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {activeTables.map((t, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl hover:border-indigo-500/40 transition-all duration-300">
                            {/* Header */}
                            <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
                              <span className="text-sm">🗄️</span>
                              <span className="font-bold text-xs text-slate-200 font-mono">{t.name}</span>
                            </div>
                            
                            {/* Columns */}
                            <div className="p-3 space-y-1.5">
                              {t.attributes.map((attr) => {
                                const isPk = t.primary_key.includes(attr);
                                return (
                                  <div key={attr} className={`flex items-center justify-between text-xs px-2 py-1 rounded font-mono ${
                                    isPk ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400'
                                  }`}>
                                    <span className="flex items-center gap-1.5">
                                      {isPk ? <span className="text-yellow-500 text-xs">🔑</span> : <span className="text-slate-600 text-xs">▪️</span>}
                                      {attr}
                                    </span>
                                    <span className="text-[9px] text-slate-600 uppercase">
                                      {isPk ? 'PK (Clave)' : 'varchar(255)'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Relationship details */}
                      {activeTables.length > 1 && (
                        <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[10px] text-slate-500 leading-relaxed font-mono">
                          <p className="font-bold text-slate-400 mb-1">🔗 Relaciones Clave Foránea (FK):</p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {activeTables.map((t, idx) => 
                              activeTables.map((otherT, otherIdx) => {
                                if (idx === otherIdx) return null;
                                const overlap = t.primary_key.filter(attr => otherT.attributes.includes(attr) && !otherT.primary_key.includes(attr));
                                if (overlap.length > 0) {
                                  return (
                                    <li key={`${idx}-${otherIdx}`}>
                                      <span className="text-indigo-400">{otherT.name}</span>({overlap.join(', ')}) → <span className="text-emerald-400">{t.name}</span>({overlap.join(', ')})
                                    </li>
                                  );
                                }
                                return null;
                              })
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">Código Mermaid ERD</h3>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <pre className="text-xs font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                        {activeMermaid}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mission */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="font-bold text-sm text-slate-700">🎯 Misión del Laboratorio</h4>
            <p className="text-xs text-slate-500 mt-1">Normaliza tu base de datos eligiendo entre 1FN, 2FN, 3FN o BCNF para ver el diagrama y las claves primarias auto-calculadas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
