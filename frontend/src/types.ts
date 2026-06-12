// types.ts — DataQuest type definitions

export interface User {
  id: number;
  correo: string;
  apodo: string;
  role: 'usuario' | 'administrador';
  medallas: string[];
  activo: boolean;
  fecha_registro: string;
}

export interface FunctionalDependency {
  determinant: string[];
  dependent: string[];
}

export interface RelationSchema {
  table_name: string;
  attributes: string[];
  dependencies: FunctionalDependency[];
}

export interface DidacticStep {
  step: string;
  explanation: string;
  violation_detail: string;
  rule_codd: string;
}

export interface DidacticDiagnosis {
  current_nf: string;
  violations: string[];
  didactic_steps: DidacticStep[];
  suggestions: string[];
}

export interface ValidationResponse {
  success: boolean;
  data: {
    schema_name: string;
    candidate_keys: string[][];
    diagnosis: DidacticDiagnosis;
    is_fully_normalized: boolean;
    message: string;
    decomposed_tables?: {
      name: string;
      attributes: string[];
      primary_key: string[];
    }[];
    sql?: string;
    mermaid?: string;
  };
}

export interface Puzzle {
  id: number;
  enunciado: string;
  tablas_inicial: Record<string, string[]>;
  df_inicial: FunctionalDependency[];
  solucion_esperada: Record<string, unknown>;
  nivel_dificultad: number;
  activo: boolean;
}

export interface IntentoPuzzle {
  id: number;
  user_id: number;
  puzzle_id: number;
  puntuacion: number;
  fecha: string;
}

export interface RetoSemanal {
  id: number;
  descripcion: string;
  tablas: Record<string, string[]>;
  df: FunctionalDependency[];
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  apodo: string;
  puntuacion_total: number;
  puzzles_completados: number;
  retos_completados: number;
  medallas: string[];
}

export interface MasteryConcept {
  concept: string;
  percentage: number;
  mastered: boolean;
}

export type ViewType = 'dashboard' | 'normalization' | 'dataquest' | 'games' | 'leaderboard';
