import React, { createContext, useContext, useState } from 'react';
import { Client, CallLog } from '@/types';
import { mockClients, mockCallLogs } from '@/data/mockData';

interface DataContextType {
  clients: Client[];
  callLogs: CallLog[];
  addCallLog: (log: Omit<CallLog, 'id'>) => void;
  searchClients: (query: string) => Client[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [clients] = useState<Client[]>(mockClients);
  const [callLogs, setCallLogs] = useState<CallLog[]>(mockCallLogs);

  const addCallLog = (log: Omit<CallLog, 'id'>) => {
    const newLog: CallLog = {
      ...log,
      id: Date.now().toString(),
    };
    setCallLogs(prev => [newLog, ...prev]);
  };

  const searchClients = (query: string): Client[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return clients.filter(
      client =>
        client.clientCode.toLowerCase().includes(lowerQuery) ||
        client.clientName.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <DataContext.Provider value={{ clients, callLogs, addCallLog, searchClients }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
