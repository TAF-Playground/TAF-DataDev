'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ExecuteSQLResult } from '@/lib/api/database';

interface QueryResultContextType {
  queryResult: ExecuteSQLResult | null;
  setQueryResult: (result: ExecuteSQLResult | null) => void;
}

const QueryResultContext = createContext<QueryResultContextType | undefined>(undefined);

export function QueryResultProvider({ children }: { children: ReactNode }) {
  const [queryResult, setQueryResult] = useState<ExecuteSQLResult | null>(null);

  return (
    <QueryResultContext.Provider
      value={{
        queryResult,
        setQueryResult,
      }}
    >
      {children}
    </QueryResultContext.Provider>
  );
}

export function useQueryResult() {
  const context = useContext(QueryResultContext);
  if (context === undefined) {
    throw new Error('useQueryResult must be used within a QueryResultProvider');
  }
  return context;
}

