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
  id: string;
  clientId: string;
  staffId: string;

  clientName: string;
  clientCode: string;
  phoneNumber: string;

  staffName: string;

  callRegarding: string;
  status: string;
  interestStatus: string;
  reminderDays?: number;
  response?: string;
  dateTime: string;
};

export default function CallLogs() {
  const { toast } = useToast();

  const [logs, setLogs] = useState<CallLogType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] =
    useState<CallLogType | null>(null);

  /* =========================
     FETCH LOGS
  ========================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetch(`/api/call-logs`)
        .then(res => res.json())
        .then(data => {
          let filtered = data;

          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((log: CallLogType) =>
              log.clientName.toLowerCase().includes(q) ||
              log.phoneNumber.includes(q) ||
              log.staffName.toLowerCase().includes(q)
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
      'Reminder Days',
      'Response',
      'Staff',
      'Date Time',
    ];

    const rows = logs.map(log => [
      log.clientCode,
      log.clientName,
      log.phoneNumber,
      log.callRegarding,
      log.status,
      log.interestStatus,
      log.reminderDays ?? '',
      log.response || '',
      log.staffName,
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
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
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

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border border-border/50 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search client, phone, staff..."
              value={searchQuery}
              onChange={e =>
                setSearchQuery(e.target.value)
              }
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Status
              </SelectItem>
              <SelectItem value="Answered">
                Answered
              </SelectItem>
              <SelectItem value="Not Answered">
                Not Answered
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Categories
              </SelectItem>
              <SelectItem value="Trading">
                Trading
              </SelectItem>
              <SelectItem value="Mutual Funds">
                Mutual Funds
              </SelectItem>
              <SelectItem value="IPO">
                IPO
              </SelectItem>
              <SelectItem value="MTF">
                MTF
              </SelectItem>
              <SelectItem value="FNO">
                FNO
              </SelectItem>
              <SelectItem value="DP Dues">
                DP Dues
              </SelectItem>
              <SelectItem value="SLBM">
                SLBM
              </SelectItem>
              <SelectItem value="Back office">
                Back office
              </SelectItem>
            </SelectContent>
          </Select>
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
                    Interest
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Staff
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
                {logs.map(log => (
                  <tr
                    key={log.id}
                    className="border-b hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium">
                        {log.clientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.clientCode}
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
                      {log.staffName}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(
                        new Date(log.dateTime),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </td>

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
              No call logs found.
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog
          open={!!selectedLog}
          onOpenChange={() => setSelectedLog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Call Log Details
              </DialogTitle>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-3">
                <p>
                  <b>Client:</b> {selectedLog.clientName}
                </p>
                <p>
                  <b>Phone:</b> {selectedLog.phoneNumber}
                </p>
                <p>
                  <b>Interest:</b>{' '}
                  {selectedLog.interestStatus}
                </p>
                {selectedLog.reminderDays && (
                  <p>
                    <b>Reminder:</b>{' '}
                    {selectedLog.reminderDays} days
                  </p>
                )}
                {selectedLog.response && (
                  <p>
                    <b>Response:</b>{' '}
                    {selectedLog.response}
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
