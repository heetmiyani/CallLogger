import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Search, Download, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  const [logs, setLogs] = useState<CallLogType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] =
    useState<CallLogType | null>(null);

  /* ================= FETCH LOGS ================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetch(`/api/call-logs`)
        .then(res => res.json())
        .then(data => {
          let filtered = data;

          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((log: CallLogType) =>
              log.client?.clientName
                ?.toLowerCase()
                .includes(q) ||
              log.client?.phoneNumber?.includes(q) ||
              log.staff?.name
                ?.toLowerCase()
                .includes(q)
            );
          }

          if (statusFilter !== 'all') {
            filtered = filtered.filter(
              (log: CallLogType) =>
                log.status === statusFilter
            );
          }

          if (categoryFilter !== 'all') {
            filtered = filtered.filter(
              (log: CallLogType) =>
                log.callRegarding === categoryFilter
            );
          }

          setLogs(filtered);
        })
        .catch(err =>
          console.error('Call logs fetch failed:', err)
        );
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, statusFilter, categoryFilter]);

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

        {/* Header */}
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

        {/* Table */}
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
