import React, { createContext, useContext } from 'react';
import type { DataClient } from '@/api/dataClient';
import { SupabaseDataClient } from '@/api/supabaseDataClient';

const DataClientContext = createContext<DataClient | undefined>(undefined);

interface DataClientProviderProps {
  client?: DataClient;
  children: React.ReactNode;
}

export function DataClientProvider({ client = SupabaseDataClient, children }: DataClientProviderProps) {
  return (
    <DataClientContext.Provider value={client}>
      {children}
    </DataClientContext.Provider>
  );
}

export function useDataClient(): DataClient {
  const context = useContext(DataClientContext);
  if (context === undefined) {
    throw new Error('useDataClient must be used within a DataClientProvider');
  }
  return context;
}
