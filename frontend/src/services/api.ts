// api.ts
import axios from 'axios';
import type { RelationSchema, ValidationResponse, MasteryConcept, DidacticStep } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar el token JWT en las cabeceras de cada petición
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (email: string, password: string): Promise<any> => {
  const response = await axiosInstance.post('/auth/login', { correo: email, password });
  const data = response.data;
  if (data.success && data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const registerUser = async (email: string, nickname: string, password: string): Promise<any> => {
  const response = await axiosInstance.post('/auth/register', { correo: email, apodo: nickname, password });
  const data = response.data;
  if (data.success && data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const guestLogin = async (): Promise<any> => {
  const response = await axiosInstance.post('/auth/guest');
  const data = response.data;
  if (data.success && data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const validateSchema = async (schema: RelationSchema): Promise<ValidationResponse> => {
  // Transforma la petición al formato esperado por el backend de Spring Boot (NormalizationRequest)
  const javaRequest = {
    attributes: schema.attributes,
    functionalDependencies: schema.dependencies.map(
      dep => `${dep.determinant.join(', ')} -> ${dep.dependent.join(', ')}`
    ),
    sourceSql: "",
    sourceCsv: ""
  };

  const response = await axiosInstance.post('/normalize/analyze', javaRequest);
  const javaResponse = response.data;

  if (response.status !== 200 || !javaResponse.success) {
    throw new Error(javaResponse.error || "Error en la validación");
  }

  const violationsList: string[] = javaResponse.violations || [];
  const currentNf: string = javaResponse.currentNormalForm || "1FN";
  const isFullyNormalized: boolean = violationsList.length === 0 || currentNf === "BCNF";

  // Crea explicaciones didácticas a partir de las violaciones devueltas por Java
  const didacticSteps: DidacticStep[] = [];
  
  if (violationsList.some(v => v.includes("2FN") || v.includes("2NF"))) {
    didacticSteps.push({
      step: "Paso 1: Violación de Segunda Forma Normal (2FN)",
      explanation: "Se detectaron dependencias parciales. Esto sucede cuando un atributo no clave depende solo de una parte de la clave primaria (cuando es compuesta).",
      violation_detail: "Para solucionarlo, debes separar los atributos con dependencias parciales en una tabla independiente.",
      rule_codd: "Regla: La relación debe estar en 1FN y todo atributo no primo debe depender de manera completa de cada clave candidata."
    });
  }

  if (violationsList.some(v => v.includes("3FN") || v.includes("3NF"))) {
    didacticSteps.push({
      step: "Paso 2: Violación de Tercera Forma Normal (3FN)",
      explanation: "Se detectaron dependencias transitivas. Esto sucede cuando un atributo depende de otro atributo que no es una clave.",
      violation_detail: "Para solucionarlo, extrae los atributos que causan la transitividad a una nueva tabla donde el determinante sea la clave primaria.",
      rule_codd: "Regla: La relación debe estar en 2FN y ningún atributo no primo puede depender transitivamente de ninguna clave candidata."
    });
  }

  const decomposedTables = javaResponse.bcnfDecomposition
    ? javaResponse.bcnfDecomposition.map((d: any) => ({
        name: d.name,
        attributes: Array.from(d.attributes || []),
        primary_key: Array.from(d.primaryKey || [])
      }))
    : [];

  const sqlStatements = javaResponse.sqlStatements
    ? javaResponse.sqlStatements.join('\n\n')
    : '';

  let mermaidDiagram = '';
  if (decomposedTables.length > 0) {
    mermaidDiagram = 'erDiagram\n';
    decomposedTables.forEach((d: any) => {
      mermaidDiagram += `  ${d.name} {\n`;
      d.attributes.forEach((a: string) => {
        const isPk = d.primary_key.includes(a);
        mermaidDiagram += `    string ${a} ${isPk ? 'PK' : ''}\n`;
      });
      mermaidDiagram += `  }\n`;
    });
  }

  return {
    success: true,
    data: {
      schema_name: schema.table_name,
      candidate_keys: javaResponse.candidateKeys || [],
      is_fully_normalized: isFullyNormalized,
      message: isFullyNormalized 
        ? "¡Excelente! El esquema se encuentra en BCNF y libre de anomalías." 
        : "El esquema requiere normalización. Revisa el diagnóstico a continuación.",
      decomposed_tables: decomposedTables,
      sql: sqlStatements,
      mermaid: mermaidDiagram,
      diagnosis: {
        current_nf: currentNf,
        violations: violationsList,
        suggestions: javaResponse.recommendations || [],
        didactic_steps: didacticSteps
      }
    }
  };
};

export const getUserMastery = async (_userId: number): Promise<MasteryConcept[]> => {
  // Retorna datos de maestría local o mock en caso de no tener una sesión guardada
  return [
    { concept: '1FN', percentage: 90, mastered: true },
    { concept: '2FN', percentage: 75, mastered: true },
    { concept: '3FN', percentage: 40, mastered: false },
    { concept: 'BCNF', percentage: 10, mastered: false },
    { concept: 'DF', percentage: 85, mastered: true },
  ];
};

export const getUserStats = async (): Promise<any> => {
  const response = await axiosInstance.get('/dashboard/stats');
  return response.data;
};

export default axiosInstance;
