import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { CallLog } from '@/types'

export default function MyLogs() {
  const { user } = useAuth()
  const { callLogs } = useData()

  const [selectedLog, setSelectedLog] =
    useState<CallLog | null>(null)

  // DataContext already filters logs for staff
  const logs =
    user?.role === 'staff'
      ? callLogs
      : []

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            My Call Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            View all your call history
          </p>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b hover:bg-muted/30"
                  >
                    {/* Client */}
                    <td className="px-6 py-4">
                      <p className="font-medium">
                        {log.client.clientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.client.clientCode}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {log.callRegarding}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant="outline">
                        {log.status}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(
                        new Date(log.dateTime),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedLog(log)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              You haven't logged any calls yet.
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog
          open={!!selectedLog}
          onOpenChange={() =>
            setSelectedLog(null)
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Call Log Details
              </DialogTitle>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <p>
                  <b>Client:</b>{' '}
                  {
                    selectedLog.client
                      .clientName
                  }
                </p>
                <p>
                  <b>Phone:</b>{' '}
                  {
                    selectedLog.client
                      .phoneNumber
                  }
                </p>
                <p>
                  <b>Status:</b>{' '}
                  {selectedLog.status}
                </p>
                <p>
                  <b>Category:</b>{' '}
                  {
                    selectedLog.callRegarding
                  }
                </p>
                <p>
                  <b>Date:</b>{' '}
                  {format(
                    new Date(
                      selectedLog.dateTime
                    ),
                    'MMMM dd, yyyy HH:mm:ss'
                  )}
                </p>

                {selectedLog.response && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Response
                    </p>
                    <div className="p-3 bg-muted rounded-lg">
                      {selectedLog.response}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}