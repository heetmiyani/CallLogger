import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Client, CallLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

/* =========================
   CONTEXT TYPE
========================= */

interface DataContextType {
  clients: Client[];
  callLogs: CallLog[];
  reminderCalls: CallLog[];

  searchClients: (query: string) => Client[];

  addCallLog: (data: any) => Promise<void>;
  reassignReminder: (
    logId: string,
    staffName: string
  ) => Promise<void>;

  refreshCallLogs: () => Promise<void>;
}

const DataContext = createContext<
  DataContextType | undefined
>(undefined);

/* =========================
   PROVIDER
========================= */

export function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [reminderCalls, setReminderCalls] =
    useState<CallLog[]>([]);

  /* =========================
     LOAD CLIENTS
  ========================= */

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          setClients([]);
        }
      })
      .catch(err =>
        console.error('Client load failed:', err)
      );
  }, []);

  /* =========================
     LOAD CALL LOGS
  ========================= */

  const refreshCallLogs = async () => {
    try {
      let url = '/api/call-logs';

      // ✅ Staff sees only their logs
      if (user?.role === 'staff') {
        url = `/api/call-logs?staffId=${user.id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const safeData = Array.isArray(data) ? data : [];

      setCallLogs(safeData);

      const reminders = safeData.filter(
        (log: CallLog) =>
          log.interestStatus === 'Interested' &&
          log.reminderDays
      );

      setReminderCalls(reminders);
    } catch (err) {
      console.error('CallLogs load failed:', err);
      setCallLogs([]);
      setReminderCalls([]);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCallLogs();
    }
  }, [user]);

  /* =========================
     ADD CALL LOG
  ========================= */

  const addCallLog = async (data: any) => {
    await fetch('/api/call-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    await refreshCallLogs();
  };

  /* =========================
     REASSIGN REMINDER
  ========================= */

  const reassignReminder = async (
    logId: string,
    staffName: string
  ) => {
    await fetch(`/api/call-logs/${logId}/reassign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });

    await refreshCallLogs();
  };

  /* =========================
     SEARCH CLIENTS
  ========================= */

  const searchClients = (query: string): Client[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return clients.filter(client =>
      client.clientCode
        .toLowerCase()
        .includes(q) ||
      client.clientName
        .toLowerCase()
        .includes(q) ||
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
        callLogs,
        reminderCalls,
        searchClients,
        addCallLog,
        reassignReminder,
        refreshCallLogs,
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
      'useData must be used within DataProvider'
    );
  }
  return context;
}
