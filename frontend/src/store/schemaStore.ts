// schemaStore.ts
import { create } from 'zustand';
import { RelationSchema } from '../types';

interface SchemaStore {
  currentSchema: RelationSchema | null;
  setCurrentSchema: (schema: RelationSchema) => void;
  clearSchema: () => void;
}

export const useSchemaStore = create<SchemaStore>((set) => ({
  currentSchema: null,
  setCurrentSchema: (schema) => set({ currentSchema: schema }),
  clearSchema: () => set({ currentSchema: null })
}));
