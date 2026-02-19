import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Search } from 'lucide-react';
import { format } from 'date-fns';

import {
  getReminderPhase,
  getReminderDate,
  getReminderBadgeVariant,
} from '@/lib/reminderUtils';
import { CallLog } from '@/types';

export default function AdminReminderCalls() {
  const { reminderCalls, reassignReminder } = useData();
  const { users } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] =
    useState<CallLog | null>(null);

  const staffUsers = users.filter(u => u.role === 'staff');

  const filtered = reminderCalls.filter(log => {
    const q = search.toLowerCase();
    return (
      log.clientName.toLowerCase().includes(q) ||
      log.clientCode.toLowerCase().includes(q) ||
      log.staffName.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Reminder Calls (Admin)
        </h1>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search client / staff..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="bg-card rounded-xl border divide-y">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">
              No reminder calls found
            </p>
          ) : (
            filtered.map(log => {
              const phase = getReminderPhase(log);
              const reminderDate = getReminderDate(log);

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {log.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Staff: {log.staffName}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      {phase && (
                        <Badge
                          variant={getReminderBadgeVariant(
                            phase
                          )}
                        >
                          {phase}
                        </Badge>
                      )}
                      {reminderDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(
                            reminderDate,
                            'MMM dd, yyyy'
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✅ VIEW BUTTON RESTORED */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLog(log)}
                  >
                    View
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* ================= VIEW MODAL ================= */}
        <Dialog
          open={!!selectedLog}
          onOpenChange={() => setSelectedLog(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Reminder Call Details
              </DialogTitle>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">
                    {selectedLog.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.clientCode} •{' '}
                    {selectedLog.phoneNumber}
                  </p>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <strong>Category:</strong>{' '}
                    {selectedLog.callRegarding}
                  </p>
                  <p>
                    <strong>Interest:</strong>{' '}
                    {selectedLog.interestStatus}
                  </p>
                  <p>
                    <strong>Response:</strong>{' '}
                    {selectedLog.response || '-'}
                  </p>
                </div>

                {/* 🔁 REASSIGN */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Reassign to staff
                  </p>

                  <Select
                    onValueChange={staff =>
                      reassignReminder(
                        selectedLog.id,
                        staff
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffUsers.map(user => (
                        <SelectItem
                          key={user.email}
                          value={user.name}
                        >
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
