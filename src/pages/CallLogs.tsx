import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Search, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    const matchesSearch = 
      log.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || log.callRegarding === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleExport = () => {
    const headers = ['Client Code', 'Client Name', 'Phone', 'Category', 'Status', 'Response', 'Staff', 'Date Time'];
    const rows = filteredLogs.map(log => [
      log.clientCode,
      log.clientName,
      log.phoneNumber,
      log.callRegarding,
      log.status,
      log.response || '',
      log.staffName,
      log.dateTime,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Call Logs</h1>
            <p className="text-muted-foreground mt-1">View and manage all call records</p>
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
                placeholder="Search by client or staff name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                <SelectItem value="Trading">Trading</SelectItem>
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
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Client</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Category</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Status</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Staff</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Date & Time</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{log.clientName}</p>
                        <p className="text-sm text-muted-foreground">{log.clientCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={log.callRegarding === 'Mutual Funds' ? 'default' : 'secondary'}>
                        {log.callRegarding}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="outline"
                        className={log.status === 'Answered' 
                          ? 'border-success text-success bg-success/10' 
                          : 'border-destructive text-destructive bg-destructive/10'
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{log.staffName}</td>
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
              <p>No call logs found matching your criteria.</p>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedLog.clientName}</p>
                    <p className="text-sm text-muted-foreground">{selectedLog.clientCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedLog.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant={selectedLog.callRegarding === 'Mutual Funds' ? 'default' : 'secondary'}>
                      {selectedLog.callRegarding}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge 
                      variant="outline"
                      className={selectedLog.status === 'Answered' 
                        ? 'border-success text-success bg-success/10' 
                        : 'border-destructive text-destructive bg-destructive/10'
                      }
                    >
                      {selectedLog.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staff</p>
                    <p className="font-medium">{selectedLog.staffName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedLog.dateTime), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                {selectedLog.response && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Response</p>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedLog.response}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
