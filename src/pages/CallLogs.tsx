import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
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
import { CallLog } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function CallLogs() {
  const { callLogs } = useData();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);

  const filteredLogs = callLogs.filter(log => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      String(log.clientName).toLowerCase().includes(q) ||
      String(log.clientCode).toLowerCase().includes(q) ||
      String(log.staffName).toLowerCase().includes(q) ||
      String(log.phoneNumber).includes(q);

    const matchesStatus =
      statusFilter === 'all' || log.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'all' || log.callRegarding === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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

    const rows = filteredLogs.map(log => [
      log.clientCode,
      log.clientName,
      log.phoneNumber,
      log.callRegarding,
      log.status,
      log.interestStatus,
      log.reminderDays ?? '',
      log.response || '',
      log.staffName,
      log.dateTime,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `call_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `${filteredLogs.length} call logs exported as CSV.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Call Logs
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all call records
            </p>
          </div>
          <Button variant="accent" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by client, phone, or staff name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Answered">Answered</SelectItem>
                <SelectItem value="Not Answered">Not Answered</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Trading">Trading</SelectItem>
                <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                <SelectItem value="IPO">IPO</SelectItem>
                <SelectItem value="MTF">MTF</SelectItem>
                <SelectItem value="FNO">FNO</SelectItem>
                <SelectItem value="DP Dues">DP Dues</SelectItem>
                <SelectItem value="SLBM">SLBM</SelectItem>
                <SelectItem value="Back office">Back office</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm">Client</th>
                  <th className="px-6 py-4 text-left text-sm">Category</th>
                  <th className="px-6 py-4 text-left text-sm">Status</th>
                  <th className="px-6 py-4 text-left text-sm">Interest</th>
                  <th className="px-6 py-4 text-left text-sm">Staff</th>
                  <th className="px-6 py-4 text-left text-sm">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <p className="font-medium">{log.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.clientCode}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="secondary">{log.callRegarding}</Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          log.status === 'Answered'
                            ? 'border-success text-success bg-success/10'
                            : 'border-destructive text-destructive bg-destructive/10'
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          log.interestStatus === 'Interested'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {log.interestStatus}
                        {log.interestStatus === 'Interested' &&
                          log.reminderDays && (
                            <span className="ml-1 text-xs">
                              ({log.reminderDays}d)
                            </span>
                          )}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-sm">{log.staffName}</td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(log.dateTime), 'MMM dd, yyyy HH:mm')}
                    </td>

                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No call logs found matching your criteria.
            </div>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Call Log Details</DialogTitle>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <p><b>Interest:</b> {selectedLog.interestStatus}</p>
                {selectedLog.reminderDays && (
                  <p><b>Reminder:</b> {selectedLog.reminderDays} days</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
