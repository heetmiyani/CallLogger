import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as XLSX from 'xlsx';
import { Client, CallLog } from '@/types';
import { getReminderPriority } from '@/lib/reminderUtils';

/* =========================
   CONTEXT TYPE
========================= */

interface DataContextType {
  clients: Client[];
  callLogs: CallLog[];

  /** 🔔 Active reminder calls only */
  reminderCalls: CallLog[];

  addCallLog: (log: Omit<CallLog, 'id'>) => void;

  /** 🔁 Admin reassign reminder */
  reassignReminder: (logId: string, newStaff: string) => void;

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
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  /* =========================
     LOAD CLIENTS + LOGS
     (ORIGINAL WORKING FLOW)
  ========================= */

  useEffect(() => {
    const storedClients =
      localStorage.getItem('calllogger_clients');
    const storedLogs =
      localStorage.getItem('calllogger_callLogs');

    if (storedLogs) {
      setCallLogs(JSON.parse(storedLogs));
    }

    // ✅ Prefer cached clients if valid
    if (storedClients) {
      const parsed = JSON.parse(storedClients);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setClients(parsed);
        return;
      }
    }

    // ✅ Load from Excel (same as original working version)
    fetch('/clients.xlsx')
      .then(res => {
        if (!res.ok) {
          throw new Error('clients.xlsx not found');
        }
        return res.arrayBuffer();
      })
      .then(data => {
        const workbook = XLSX.read(data, {
          type: 'array',
        });

        const sheet =
          workbook.Sheets[workbook.SheetNames[0]];

        const parsedClients =
          XLSX.utils.sheet_to_json<Client>(sheet);

        setClients(parsedClients);
        localStorage.setItem(
          'calllogger_clients',
          JSON.stringify(parsedClients)
        );
      })
      .catch(err =>
        console.error('❌ Client Excel load failed:', err)
      );
  }, []);

  /* =========================
     PERSIST CALL LOGS
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      'calllogger_callLogs',
      JSON.stringify(callLogs)
    );
  }, [callLogs]);

  /* =========================
     ADD CALL LOG
     🔁 AUTO-CLEAR REMINDER
  ========================= */

  const addCallLog = (log: Omit<CallLog, 'id'>) => {
    setCallLogs(prev => {
      // Auto-resolve previous reminder for same client
      const updated = prev.map(existing => {
        if (
          existing.clientCode === log.clientCode &&
          existing.reminderDays !== undefined &&
          existing.isReminderResolved !== true
        ) {
          return {
            ...existing,
            isReminderResolved: true,
          };
        }
        return existing;
      });

      const newLog: CallLog = {
        ...log,
        id: Date.now().toString(),
        isReminderResolved: false,
      };

      return [newLog, ...updated];
    });
  };

  /* =========================
     🔁 ADMIN: REASSIGN REMINDER
  ========================= */

  const reassignReminder = (
    logId: string,
    newStaff: string
  ) => {
    setCallLogs(prev =>
      prev.map(log =>
        log.id === logId
          ? { ...log, staffName: newStaff }
          : log
      )
    );
  };

  /* =========================
     🔔 ACTIVE REMINDERS
  ========================= */

  const reminderCalls = [...callLogs]
    .filter(
      log =>
        log.reminderDays !== undefined &&
        log.isReminderResolved !== true
    )
    .sort(
      (a, b) =>
        getReminderPriority(a) -
        getReminderPriority(b)
    );

  /* =========================
     🔍 CLIENT SEARCH (STABLE)
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
        callLogs,
        reminderCalls,
        addCallLog,
        reassignReminder,
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
