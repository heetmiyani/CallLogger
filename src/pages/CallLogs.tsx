import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CallLogType = {
  id: number;
  callRegarding: string;
  status: string;
  interestStatus: string;
  reminderDays?: number;
  response?: string;
  dateTime: string;

  client?: {
    clientName: string;
    clientCode: string;
    phoneNumber: string;
  };

  staff?: {
    name: string;
  };
};

export default function CallLogs() {
  const { toast } = useToast();

  const [allLogs, setAllLogs] = useState<CallLogType[]>([]);
  const [logs, setLogs] = useState<CallLogType[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<
    'today' | '7days' | '30days' | 'month' | 'overall' | 'custom'
  >('today');

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch('/api/call-logs')
      .then(res => res.json())
      .then(data => setAllLogs(data))
      .catch(err =>
        console.error('Call logs fetch failed:', err)
      );
  }, []);

  /* ================= FILTERING ================= */

  useEffect(() => {
    const now = new Date();

    let filtered = [...allLogs];

    /* SEARCH */
    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      filtered = filtered.filter(log =>
        log.client?.clientName?.toLowerCase().includes(q) ||
        log.client?.clientCode?.toLowerCase().includes(q)
      );
    }

    /* DATE FILTER */

    filtered = filtered.filter(log => {
      const logDate = new Date(log.dateTime);

      if (filter === 'today') {
        return logDate.toDateString() === now.toDateString();
      }

      if (filter === '7days') {
        const past = new Date();
        past.setDate(now.getDate() - 7);
        return logDate >= past;
      }

      if (filter === '30days') {
        const past = new Date();
        past.setDate(now.getDate() - 30);
        return logDate >= past;
      }

      if (filter === 'month') {
        return (
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        );
      }

      if (filter === 'custom' && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);

        return logDate >= start && logDate <= end;
      }

      return true;
    });

    setLogs(filtered);
  }, [searchQuery, filter, customStart, customEnd, allLogs]);

  /* ================= EXPORT ================= */

  const handleExport = () => {
    const headers = [
      'Client Code',
      'Client Name',
      'Phone',
      'Category',
      'Status',
      'Interest',
      'Reminder Days',
      'Response',
      'Staff',
      'Date Time',
    ];

    const rows = logs.map(log => [
      log.client?.clientCode || '',
      log.client?.clientName || '',
      log.client?.phoneNumber || '',
      log.callRegarding,
      log.status,
      log.interestStatus,
      log.reminderDays ?? '',
      log.response || '',
      log.staff?.name || '',
      format(new Date(log.dateTime), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${cell}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv',
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `call_logs_${new Date()
      .toISOString()
      .split('T')[0]}.csv`;

    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `${logs.length} call logs exported.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Call Logs
            </h1>
            <p className="text-muted-foreground">
              View and manage all call records
            </p>
          </div>

          <Button variant="accent" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* SEARCH */}
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Search by client name or client code..."
            value={searchQuery}
            onChange={e =>
              setSearchQuery(e.target.value)
            }
          />
        </div>

        {/* FILTERS */}
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

        {/* CUSTOM DATE RANGE */}
        {filter === 'custom' && (
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={customStart}
              onChange={e =>
                setCustomStart(e.target.value)
              }
              className="border rounded px-3 py-1"
            />

            <span>to</span>

            <input
              type="date"
              value={customEnd}
              onChange={e =>
                setCustomEnd(e.target.value)
              }
              className="border rounded px-3 py-1"
            />
          </div>
        )}

        {/* TABLE */}
        <div className="bg-card rounded-xl shadow-card border overflow-hidden">
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
                    Interest
                  </th>

                  <th className="px-6 py-4 text-left text-sm">
                    Response
                  </th>

                  <th className="px-6 py-4 text-left text-sm">
                    Staff
                  </th>

                  <th className="px-6 py-4 text-left text-sm">
                    Date & Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map(log => (
                  <tr
                    key={log.id}
                    className="border-b hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium">
                        {log.client?.clientName || 'N/A'}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {log.client?.clientCode}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {log.callRegarding}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="outline">
                        {log.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {log.interestStatus}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {log.response || '-'}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {log.staff?.name || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(
                        new Date(log.dateTime),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No call logs found.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}