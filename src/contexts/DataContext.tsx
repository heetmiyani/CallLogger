import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Client } from '@/types';

/* =========================
   CONTEXT TYPE
========================= */

interface DataContextType {
  clients: Client[];

  /** 🔍 Client search */
  searchClients: (query: string) => Client[];
}

const DataContext = createContext<DataContextType | undefined>(
  undefined
);

/* =========================
   PROVIDER
========================= */

export function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clients, setClients] = useState<Client[]>([]);

  /* =========================
     LOAD CLIENTS FROM DATABASE
  ========================= */

  useEffect(() => {
    fetch('/api/clients')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch clients');
        }
        return res.json();
      })
      .then(data => {
        setClients(data);
      })
      .catch(err =>
        console.error('❌ Client API load failed:', err)
      );
  }, []);

  /* =========================
     🔍 CLIENT SEARCH (Frontend helper)
     NOTE: For dropdown autocomplete only
  ========================= */

  const searchClients = (query: string): Client[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return clients.filter(client =>
      client.clientCode.toLowerCase().includes(q) ||
      client.clientName.toLowerCase().includes(q) ||
      client.phoneNumber.includes(q)
    );
  };

  /* =========================
     PROVIDER
  ========================= */

  return (
    <DataContext.Provider
      value={{
        clients,
        searchClients,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      'useData must be used within a DataProvider'
    );
  }
  return context;
}
