import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ClientSearch from '@/components/staff/ClientSearch'
import CallLogModal from '@/components/staff/CallLogModal'
import StatsCard from '@/components/dashboard/StatsCard'
import { Client, CallLog } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { useToast } from '@/hooks/use-toast'

import {
  PhoneCall,
  PhoneOff,
  TrendingUp,
  Bell,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

import {
  getReminderPhase,
  getReminderDate,
  getReminderBadgeVariant,
} from '@/lib/reminderUtils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function StaffDashboard() {

  const { user } = useAuth()
  const { callLogs } = useData()
  const { toast } = useToast()

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null)

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [previewLog, setPreviewLog] =
    useState<CallLog | null>(null)

  const [previewOpen, setPreviewOpen] =
    useState(false)

  const [completedReminders, setCompletedReminders] =
    useState<number[]>([])

  const [activeReminderId, setActiveReminderId] =
    useState<number | null>(null)

  const logs =
    user?.role === 'staff'
      ? callLogs
      : []

  /* =========================
     TODAY LOGS
  ========================= */

  const todayLogs = logs.filter(
    (log) =>
      new Date(log.dateTime).toDateString() ===
      new Date().toDateString()
  )

  /* =========================
     REMINDER LOGS
  ========================= */

  const reminderLogs = logs.filter(
    (log) =>
      log.interestStatus === 'Interested' &&
      log.reminderDays !== null &&
      !completedReminders.includes(log.id)
  )

  /* =========================
     RELOG CLICK
  ========================= */

  const handleReLog = (log: CallLog) => {
    setPreviewLog(log)
    setPreviewOpen(true)
  }

  const openCallModal = () => {

    if (!previewLog) return

    setActiveReminderId(previewLog.id)

    setSelectedClient({
      id: previewLog.client.id,
      clientCode: previewLog.client.clientCode,
      clientName: previewLog.client.clientName,
      phoneNumber: previewLog.client.phoneNumber,
    })

    setPreviewOpen(false)
    setIsModalOpen(true)
  }

  /* =========================
     CLIENT SEARCH
  ========================= */

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  /* =========================
     MODAL CLOSE (AFTER SAVE)
  ========================= */

  const handleCloseModal = () => {

    setIsModalOpen(false)
    setSelectedClient(null)

    if (activeReminderId) {

      setCompletedReminders((prev) => [
        ...prev,
        activeReminderId
      ])

      toast({
        title: "Reminder Completed",
        description: "Call logged successfully",
      })

      setActiveReminderId(null)
    }
  }

  return (

    <DashboardLayout>

      <div className="space-y-8 animate-fade-in">

        {/* HEADER */}

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Welcome, {user?.name}!
          </h1>

          <p className="text-muted-foreground mt-1">
            Search for clients and manage reminder calls
          </p>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <StatsCard
            title="Calls Today"
            value={todayLogs.length}
            icon={PhoneCall}
          />

          <StatsCard
            title="Answered Today"
            value={
              todayLogs.filter(
                (l) => l.status === 'Answered'
              ).length
            }
            icon={TrendingUp}
            variant="success"
          />

          <StatsCard
            title="Not Answered"
            value={
              todayLogs.filter(
                (l) => l.status === 'Not Answered'
              ).length
            }
            icon={PhoneOff}
            variant="warning"
          />

        </div>

        {/* CLIENT SEARCH */}

        <ClientSearch onSelectClient={handleSelectClient} />

        {/* REMINDER CALLS */}

        <div className="bg-card rounded-xl border shadow-card">

          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Reminder Calls
            </h2>
          </div>

          {reminderLogs.length === 0 ? (

            <div className="p-6 text-center text-muted-foreground">
              No reminder calls available.
            </div>

          ) : (

            <div className="divide-y">

              {reminderLogs.map((log) => {

                const reminderDate =
                  getReminderDate(log)

                const phase =
                  getReminderPhase(log)

                const today = new Date()

                const relogAllowed =
                  reminderDate &&
                  new Date(today.setHours(0,0,0,0)) >=
                  new Date(reminderDate.setHours(0,0,0,0))

                return (

                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4"
                  >

                    <div className="space-y-1">

                      <p className="font-medium">
                        {log.client.clientName}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">

                        <span>
                          {log.callRegarding}
                        </span>

                        {phase && (
                          <Badge
                            variant={getReminderBadgeVariant(
                              phase
                            )}
                          >
                            {phase}
                          </Badge>
                        )}

                      </div>

                      {reminderDate && (
                        <p className="text-xs text-muted-foreground">
                          Reminder on{' '}
                          {format(
                            reminderDate,
                            'MMM dd, yyyy'
                          )}
                        </p>
                      )}

                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleReLog(log)}
                      disabled={!relogAllowed}
                    >
                      Re-Log Call
                    </Button>

                  </div>

                )
              })}

            </div>
          )}

        </div>

        {/* PREVIOUS CALL PREVIEW MODAL */}

        <Dialog
          open={previewOpen}
          onOpenChange={() =>
            setPreviewOpen(false)
          }
        >

          <DialogContent>

            <DialogHeader>
              <DialogTitle>
                Previous Call Details
              </DialogTitle>
            </DialogHeader>

            {previewLog && (

              <div className="space-y-4">

                <p>
                  <b>Client:</b>{' '}
                  {previewLog.client.clientName}
                </p>

                <p>
                  <b>Category:</b>{' '}
                  {previewLog.callRegarding}
                </p>

                <p>
                  <b>Status:</b>{' '}
                  {previewLog.status}
                </p>

                <p>
                  <b>Interest:</b>{' '}
                  {previewLog.interestStatus}
                </p>

                {previewLog.response && (
                  <p>
                    <b>Response:</b>{' '}
                    {previewLog.response}
                  </p>
                )}

                <p>
                  <b>Last Call:</b>{' '}
                  {format(
                    new Date(previewLog.dateTime),
                    'MMM dd, yyyy HH:mm'
                  )}
                </p>

                <div className="flex justify-end gap-3 pt-4">

                  <Button
                    variant="outline"
                    onClick={() =>
                      setPreviewOpen(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={openCallModal}
                  >
                    Next
                  </Button>

                </div>

              </div>

            )}

          </DialogContent>

        </Dialog>

        {/* CALL LOG MODAL */}

        <CallLogModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

      </div>

    </DashboardLayout>
  )
}