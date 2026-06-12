// NormalizationQuestLab.tsx
import React, { useState } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { validateSchema } from '../services/api';
import { Tooltip } from './Tooltip';
import { DiagnosisPanel } from './DiagnosisPanel';
import { RelationSchema, FunctionalDependency, ValidationResponse } from '../types';

export const NormalizationQuestLab: React.FC = () => {
  const [tableName, setTableName] = useState('Estudiante');
  const [attributes, setAttributes] = useState(['id_est', 'nombre', 'ciudad']);
  const [dependencies, setDependencies] = useState<FunctionalDependency[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setCurrentSchema } = useSchemaStore();

  const schema: RelationSchema = {
    table_name: tableName,
    attributes,
    dependencies
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setErrorMessage(null);
    setCurrentSchema(schema);

    try {
      const response = await validateSchema(schema);
      setValidation(response);
    } catch (error) {
      console.error('Error validando:', error);
      setErrorMessage('No se pudo validar el esquema. Verifica que el backend esté funcionando.');
    } finally {
      setIsValidating(false);
    }
  };

  const addAttribute = () => {
    const newAttr = prompt('Ingresa el nombre del atributo:');
    if (newAttr && !attributes.includes(newAttr)) {
      setAttributes([...attributes, newAttr]);
    } else if (newAttr) {
      alert('El atributo ya existe');
    }
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const addDependency = () => {
    const det = prompt('Determinante (separado por comas, ej: "id_est"):')?.split(',').map(s => s.trim()) || [];
    const dep = prompt('Dependiente (separado por comas, ej: "nombre,apellido"):')?.split(',').map(s => s.trim()) || [];

    if (det.length > 0 && dep.length > 0) {
      // Evitar duplicados simples
      const exists = dependencies.some(d =>
          JSON.stringify(d.determinant) === JSON.stringify(det) &&
          JSON.stringify(d.dependent) === JSON.stringify(dep)
      );
      if (!exists) {
        setDependencies([...dependencies, { determinant: det, dependent: dep }]);
      } else {
        alert('Esta dependencia ya existe');
      }
    }
  };

  const removeDependency = (index: number) => {
    setDependencies(dependencies.filter((_, i) => i !== index));
  };

  const getStatusColor = () => {
    if (!validation) return 'bg-gray-100';
    return validation.data.is_fully_normalized ? 'bg-green-100' : 'bg-red-100';
  };

  const getIntelligentTip = (): string => {
    if (!validation) {
      return "💡 Define los atributos y las dependencias funcionales haciendo clic en los botones. El sistema te dirá si está normalizado.";
    }

    const { violations } = validation.data.diagnosis;

    if (violations.includes('2FN')) {
      return "🔍 Pista: ¿Algún atributo no clave depende solo de parte de la clave primaria? Revisa dependencias parciales.";
    }
    if (violations.includes('3FN')) {
      return "🧠 Pista de Codd: Los atributos no clave no deben depender de otros atributos no clave. Busca cadenas de dependencia.";
    }
    return "✅ ¡Tu esquema está completamente normalizado!";
  };

  return (
      <div className="flex gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className={`flex-1 border-2 border-dashed border-blue-300 rounded-lg p-6 ${getStatusColor()} transition-colors`}>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">📋 Construcción del Esquema</h2>

            <div>
              <label className="block font-semibold mb-2">Nombre de la Tabla:</label>
              <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="ej: Estudiante"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Atributos:</label>
              <div className="space-y-2">
                {attributes.map((attr, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                      <span className="font-mono">{attr}</span>
                      <button
                          onClick={() => removeAttribute(idx)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          aria-label="Eliminar atributo"
                      >
                        ✕
                      </button>
                    </div>
                ))}
              </div>
              <button
                  onClick={addAttribute}
                  className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                + Agregar Atributo
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-2">Dependencias Funcionales:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dependencies.map((dep, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="text-sm font-mono">
                    {'{' + dep.determinant.join(',') + '}'} → {'{' + dep.dependent.join(',') + '}'}
                  </span>
                      <button
                          onClick={() => removeDependency(idx)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          aria-label="Eliminar dependencia"
                      >
                        ✕
                      </button>
                    </div>
                ))}
              </div>
              <button
                  onClick={addDependency}
                  className="mt-2 w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
              >
                + Agregar Dependencia
              </button>
            </div>
          </div>
        </div>

        <div className="w-96 space-y-4">
          <Tooltip message={getIntelligentTip()} />

          <button
              onClick={handleValidate}
              disabled={isValidating || attributes.length === 0}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
          >
            {isValidating ? '⏳ Validando...' : '✓ Validar Normalización'}
          </button>

          {errorMessage && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-sm font-semibold">
                ⚠️ {errorMessage}
              </div>
          )}

          {validation && (
              <>
                <div className={`p-4 rounded-lg text-center ${validation.data.is_fully_normalized ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="text-sm font-semibold">
                    {validation.data.message}
                  </p>
                </div>
                <DiagnosisPanel diagnosis={validation.data.diagnosis} />
              </>
          )}

          <div className="text-sm text-gray-600 mt-4 bg-white p-4 rounded-lg">
            <h4 className="font-bold">🎯 Misión Actual:</h4>
            <p>Alcanza BCNF para liberar los datos de anomalías</p>
          </div>
        </div>
      </div>
  );
};