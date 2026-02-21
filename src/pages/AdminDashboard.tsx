import { useData } from '@/contexts/DataContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/dashboard/StatsCard'
import CallChart from '@/components/dashboard/CallChart'
import RecentCallsTable from '@/components/dashboard/RecentCallsTable'
import { Button } from '@/components/ui/button'
import {
  PhoneCall,
  PhoneOff,
  TrendingUp,
  Users,
  Download,
  BellRing,
  AlertTriangle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getReminderPhase } from '@/lib/reminderUtils'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const { callLogs, reminderCalls } = useData()
  const { toast } = useToast()

  /* =========================
     CALL STATS
  ========================= */
  const totalCalls = callLogs.length

  const answeredCalls = callLogs.filter(
    (log) => log.status === 'Answered'
  ).length

  const notAnsweredCalls = callLogs.filter(
    (log) => log.status === 'Not Answered'
  ).length

  const answerRate =
    totalCalls > 0
      ? Math.round(
          (answeredCalls / totalCalls) * 100
        )
      : 0

  /* =========================
     ACTIVE STAFF (STRICT RELATIONAL)
  ========================= */
  const activeStaff = new Set(
    callLogs.map((log) => log.staffId)
  ).size

  /* =========================
     REMINDER STATS
  ========================= */
  const activeReminders = reminderCalls.filter(
    (log) => {
      const phase = getReminderPhase(log)
      return (
        phase === 'ACTIVE' ||
        phase === 'UPCOMING'
      )
    }
  ).length

  const overdueReminders =
    reminderCalls.filter((log) => {
      const phase = getReminderPhase(log)
      return (
        phase === 'WARNING' ||
        phase === 'CRITICAL'
      )
    }).length

  /* =========================
     EXPORT CSV (STRICT RELATIONAL)
  ========================= */
  const handleExport = () => {
    const headers = [
      'Client Code',
      'Client Name',
      'Phone',
      'Category',
      'Status',
      'Interest',
      'Response',
      'Staff',
      'Date Time',
    ]

    const rows = callLogs.map((log) => [
      log.client.clientCode,
      log.client.clientName,
      log.client.phoneNumber,
      log.callRegarding,
      log.status,
      log.interestStatus,
      log.response ?? '',
      log.staff.name,
      format(
        new Date(log.dateTime),
        'yyyy-MM-dd HH:mm'
      ),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv',
    })

    const url =
      window.URL.createObjectURL(blob)

    const a =
      document.createElement('a')
    a.href = url
    a.download = `call_logs_${new Date()
      .toISOString()
      .split('T')[0]}.csv`

    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Export Successful',
      description:
        'Call logs downloaded as CSV.',
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of all call & reminder activity
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Calls"
            value={totalCalls}
            icon={PhoneCall}
            variant="default"
          />

          <StatsCard
            title="Answered"
            value={answeredCalls}
            icon={TrendingUp}
            variant="success"
            subtitle={`${answerRate}% answer rate`}
          />

          <StatsCard
            title="Not Answered"
            value={notAnsweredCalls}
            icon={PhoneOff}
            variant="warning"
          />

          <StatsCard
            title="Active Staff"
            value={activeStaff}
            icon={Users}
            variant="accent"
          />
        </div>

        {/* ================= REMINDER STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Active Reminders"
            value={activeReminders}
            icon={BellRing}
            variant="accent"
          />

          <StatsCard
            title="Overdue Reminders"
            value={overdueReminders}
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        {/* ================= CHARTS ================= */}
        <CallChart />

        {/* ================= RECENT CALLS ================= */}
        <RecentCallsTable
          limit={10}
          showStaff
        />
      </div>
    </DashboardLayout>
  )
}