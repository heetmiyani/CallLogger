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
import { useState } from 'react'

export default function AdminDashboard() {
  const { callLogs, reminderCalls } = useData()
  const { toast } = useToast()

  /* =========================
     FILTER STATE
  ========================= */

  const [filter, setFilter] = useState<
    'today' | '7days' | '30days' | 'month' | 'overall' | 'custom'
  >('today')

  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const now = new Date()

  /* =========================
     FILTERED LOGS
  ========================= */

  const filteredLogs = callLogs.filter((log) => {
    const logDate = new Date(log.dateTime)

    if (filter === 'today') {
      return logDate.toDateString() === now.toDateString()
    }

    if (filter === '7days') {
      const past = new Date()
      past.setDate(now.getDate() - 7)
      return logDate >= past
    }

    if (filter === '30days') {
      const past = new Date()
      past.setDate(now.getDate() - 30)
      return logDate >= past
    }

    if (filter === 'month') {
      return (
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === now.getFullYear()
      )
    }

    if (filter === 'custom' && customStart && customEnd) {
      const start = new Date(customStart)
      const end = new Date(customEnd)
      end.setHours(23, 59, 59, 999)

      return logDate >= start && logDate <= end
    }

    return true
  })

  /* =========================
     CALL STATS
  ========================= */

  const totalCalls = filteredLogs.length

  const answeredCalls = filteredLogs.filter(
    (log) => log.status === 'Answered'
  ).length

  const notAnsweredCalls = filteredLogs.filter(
    (log) => log.status === 'Not Answered'
  ).length

  const answerRate =
    totalCalls > 0
      ? Math.round(
          (answeredCalls / totalCalls) * 100
        )
      : 0

  /* =========================
     ACTIVE STAFF
  ========================= */

  const activeStaff = new Set(
    filteredLogs.map((log) => log.staffId)
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
     EXPORT CSV
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

        {/* ================= FILTERS ================= */}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === 'today' ? 'default' : 'outline'}
            onClick={() => setFilter('today')}
          >
            Today
          </Button>

          <Button
            size="sm"
            variant={filter === '7days' ? 'default' : 'outline'}
            onClick={() => setFilter('7days')}
          >
            Last 7 Days
          </Button>

          <Button
            size="sm"
            variant={filter === '30days' ? 'default' : 'outline'}
            onClick={() => setFilter('30days')}
          >
            Last 30 Days
          </Button>

          <Button
            size="sm"
            variant={filter === 'month' ? 'default' : 'outline'}
            onClick={() => setFilter('month')}
          >
            This Month
          </Button>

          <Button
            size="sm"
            variant={filter === 'overall' ? 'default' : 'outline'}
            onClick={() => setFilter('overall')}
          >
            Overall
          </Button>

          <Button
            size="sm"
            variant={filter === 'custom' ? 'default' : 'outline'}
            onClick={() => setFilter('custom')}
          >
            Custom Range
          </Button>
        </div>

        {/* ================= CUSTOM RANGE ================= */}

        {filter === 'custom' && (
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={customStart}
              onChange={(e) =>
                setCustomStart(e.target.value)
              }
              className="border rounded px-3 py-1"
            />

            <span>to</span>

            <input
              type="date"
              value={customEnd}
              onChange={(e) =>
                setCustomEnd(e.target.value)
              }
              className="border rounded px-3 py-1"
            />
          </div>
        )}

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

        {/* ================= CHART ================= */}

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