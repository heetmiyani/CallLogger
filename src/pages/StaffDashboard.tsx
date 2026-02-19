import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientSearch from '@/components/staff/ClientSearch';
import CallLogModal from '@/components/staff/CallLogModal';
import StatsCard from '@/components/dashboard/StatsCard';
import { Client, CallLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  PhoneCall,
  PhoneOff,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  getReminderDate,
  getReminderPhase,
  getReminderBadgeVariant,
} from '@/lib/reminderUtils';

export default function StaffDashboard() {
  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const { callLogs, reminderCalls } = useData();

  // 🔹 Logs of current staff only
  const myLogs = callLogs.filter(
    log => log.staffName === user?.name
  );

  // 🔹 Today stats
  const todayLogs = myLogs.filter(log => {
    return (
      new Date(log.dateTime).toDateString() ===
      new Date().toDateString()
    );
  });

  // 🔔 Reminder calls of this staff (already sorted by priority)
  const myReminderCalls = reminderCalls.filter(
    log => log.staffName === user?.name
  );

  const handleReLog = (log: CallLog) => {
    setSelectedClient({
      clientCode: log.clientCode,
      clientName: log.clientName,
      phoneNumber: log.phoneNumber,
    });
    setIsModalOpen(true);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Welcome, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Search for clients and manage reminder calls
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Calls Today"
            value={todayLogs.length}
            icon={PhoneCall}
          />
          <StatsCard
            title="Answered Today"
            value={
              todayLogs.filter(
                l => l.status === 'Answered'
              ).length
            }
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Not Answered"
            value={
              todayLogs.filter(
                l => l.status === 'Not Answered'
              ).length
            }
            icon={PhoneOff}
            variant="warning"
          />
        </div>

        {/* Client Search */}
        <ClientSearch onSelectClient={handleSelectClient} />

        {/* 🔔 Reminder Calls */}
        <div className="bg-card rounded-xl border shadow-card">
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Reminder Calls
            </h2>
          </div>

          {myReminderCalls.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No reminder calls available.
            </div>
          ) : (
            <div className="divide-y">
              {myReminderCalls.map(log => {
                const phase = getReminderPhase(log);
                const reminderDate = getReminderDate(log);
                const isUnlocked = phase !== 'UPCOMING';

                return (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {log.clientName}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{log.callRegarding}</span>
                        {phase && (
                          <Badge
                            variant={getReminderBadgeVariant(
                              phase
                            )}
                          >
                            {phase}
                          </Badge>
                        )}
                      </div>

                      {reminderDate && (
                        <p className="text-xs text-muted-foreground">
                          Reminder on{' '}
                          {format(
                            reminderDate,
                            'MMM dd, yyyy'
                          )}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      disabled={!isUnlocked}
                      onClick={() => handleReLog(log)}
                    >
                      Re-Log Call
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Call Log Modal */}
        <CallLogModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </DashboardLayout>
  );
}
