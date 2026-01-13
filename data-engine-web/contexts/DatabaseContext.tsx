'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { DatabaseConnection } from '@/lib/api/database';

interface DatabaseContextType {
  selectedDatabase: DatabaseConnection | null;
  setSelectedDatabase: (db: DatabaseConnection | null) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseConnection | null>(null);

  return (
    <DatabaseContext.Provider
      value={{
        selectedDatabase,
        setSelectedDatabase,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

