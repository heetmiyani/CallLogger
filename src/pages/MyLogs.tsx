import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { CallLog } from '@/types';

export default function MyLogs() {
  const { user } = useAuth();
  const { callLogs } = useData();
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);

  const myLogs = callLogs.filter(log => log.staffId === user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Call Logs</h1>
          <p className="text-muted-foreground mt-1">View all your call history</p>
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
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Date & Time</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {myLogs.map((log) => (
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

          {myLogs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't logged any calls yet.</p>
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
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedLog.dateTime), 'MMMM dd, yyyy HH:mm:ss')}
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
