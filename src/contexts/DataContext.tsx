import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { Client, CallLog } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

/* =========================
   CONTEXT TYPE
========================= */

interface DataContextType {
  clients: Client[]
  callLogs: CallLog[]
  reminderCalls: CallLog[]

  searchClients: (query: string) => Client[]

  addCallLog: (data: {
    clientId: number
    staffId: number
    callRegarding: string
    status: string
    interestStatus: string
    reminderDays?: number | null
    response?: string | null
  }) => Promise<void>

  reassignReminder: (
    logId: number,
    staffId: number
  ) => Promise<void>

  refreshCallLogs: () => Promise<void>
}

const DataContext = createContext<
  DataContextType | undefined
>(undefined)

/* =========================
   PROVIDER
========================= */

export function DataProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  const [clients, setClients] =
    useState<Client[]>([])
  const [callLogs, setCallLogs] =
    useState<CallLog[]>([])
  const [reminderCalls, setReminderCalls] =
    useState<CallLog[]>([])

  /* =========================
     LOAD CLIENTS
  ========================= */

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch('/api/clients')

        if (!res.ok)
          throw new Error('Failed to load clients')

        const data = await res.json()

        setClients(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Client load failed:', err)
        setClients([])
      }
    }

    loadClients()
  }, [])

  /* =========================
     LOAD CALL LOGS
  ========================= */

  const refreshCallLogs = useCallback(async () => {
    try {
      let url = '/api/call-logs'

      if (user?.role === 'staff') {
        url = `/api/call-logs?staffId=${user.id}`
      }

      const res = await fetch(url)

      if (!res.ok)
        throw new Error('Failed to load call logs')

      const data = await res.json()

      const safeData: CallLog[] =
        Array.isArray(data) ? data : []

      setCallLogs(safeData)

      const reminders = safeData.filter(
        (log) =>
          log.interestStatus === 'Interested' &&
          log.reminderDays != null
      )

      setReminderCalls(reminders)
    } catch (err) {
      console.error('CallLogs load failed:', err)
      setCallLogs([])
      setReminderCalls([])
    }
  }, [user])

  /* Initial Load */
  useEffect(() => {
    if (user) {
      refreshCallLogs()
    }
  }, [user, refreshCallLogs])

  /* =========================
     AUTO REFRESH (LIVE SYNC)
     Refresh every 10 seconds
  ========================= */

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshCallLogs()
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [user, refreshCallLogs])

  /* =========================
     ADD CALL LOG
  ========================= */

  const addCallLog = async (data: {
    clientId: number
    staffId: number
    callRegarding: string
    status: string
    interestStatus: string
    reminderDays?: number | null
    response?: string | null
  }) => {
    try {
      const res = await fetch('/api/call-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok)
        throw new Error('Failed to add call log')

      await refreshCallLogs()
    } catch (err) {
      console.error('Add CallLog failed:', err)
    }
  }

  /* =========================
     REASSIGN REMINDER
  ========================= */

  const reassignReminder = async (
    logId: number,
    staffId: number
  ) => {
    try {
      const res = await fetch(
        `/api/call-logs/${logId}/reassign`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            staffId,
          }),
        }
      )

      if (!res.ok)
        throw new Error(
          'Failed to reassign reminder'
        )

      await refreshCallLogs()
    } catch (err) {
      console.error(
        'Reassign reminder failed:',
        err
      )
    }
  }

  /* =========================
     SEARCH CLIENTS
  ========================= */

  const searchClients = (
    query: string
  ): Client[] => {
    if (!query.trim()) return []

    const q = query.toLowerCase()

    return clients.filter(
      (client) =>
        client.clientCode
          .toLowerCase()
          .includes(q) ||
        client.clientName
          .toLowerCase()
          .includes(q) ||
        client.phoneNumber.includes(q)
    )
  }

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
  )
}

/* =========================
   HOOK
========================= */

export function useData() {
  const context = useContext(DataContext)

  if (!context) {
    throw new Error(
      'useData must be used within DataProvider'
    )
  }

  return context
}