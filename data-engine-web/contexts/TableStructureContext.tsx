'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { TableStructure } from '@/lib/api/database';

interface TableStructureContextType {
  tableStructure: TableStructure | null;
  setTableStructure: (structure: TableStructure | null) => void;
}

const TableStructureContext = createContext<TableStructureContextType | undefined>(undefined);

export function TableStructureProvider({ children }: { children: ReactNode }) {
  const [tableStructure, setTableStructure] = useState<TableStructure | null>(null);

  return (
    <TableStructureContext.Provider
      value={{
        tableStructure,
        setTableStructure,
      }}
    >
      {children}
    </TableStructureContext.Provider>
  );
}

export function useTableStructure() {
  const context = useContext(TableStructureContext);
  if (context === undefined) {
    throw new Error('useTableStructure must be used within a TableStructureProvider');
  }
  return context;
}
