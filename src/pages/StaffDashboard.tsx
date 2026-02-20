import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientSearch from '@/components/staff/ClientSearch';
import CallLogModal from '@/components/staff/CallLogModal';
import StatsCard from '@/components/dashboard/StatsCard';
import { Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  PhoneCall,
  PhoneOff,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type CallLogWithClient = {
  id: number;
  staffName: string;
  callRegarding: string;
  status: string;
  interestStatus: string;
  reminderDays?: number | null;
  dateTime: string;
  client: {
    id: number;
    clientCode: string;
    clientName: string;
    phoneNumber: string;
  };
};

export default function StaffDashboard() {
  const { user } = useAuth();

  const [logs, setLogs] = useState<CallLogWithClient[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  /* =========================
     FETCH STAFF LOGS
  ========================= */

  useEffect(() => {
    if (!user?.name) return;

    fetch(`/api/call-logs?staff=${user.id}`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err =>
        console.error('Failed to fetch logs:', err)
      );
  }, [user]);

  /* =========================
     TODAY LOGS
  ========================= */

  const todayLogs = logs.filter(
    log =>
      new Date(log.dateTime).toDateString() ===
      new Date().toDateString()
  );

  /* =========================
     REMINDER LOGS
  ========================= */

  const reminderLogs = logs.filter(
    log => log.reminderDays !== null && log.reminderDays !== undefined
  );

  const handleReLog = (log: CallLogWithClient) => {
    setSelectedClient({
      id: log.client.id,
      clientCode: log.client.clientCode,
      clientName: log.client.clientName,
      phoneNumber: log.client.phoneNumber,
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

        {/* =========================
            STATS
        ========================= */}

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

        {/* =========================
            CLIENT SEARCH
        ========================= */}

        <ClientSearch
          onSelectClient={handleSelectClient}
        />

        {/* =========================
            REMINDER SECTION
        ========================= */}

        <div className="bg-card rounded-xl border shadow-card">
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Reminder Calls
            </h2>
          </div>

          {reminderLogs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No reminder calls available.
            </div>
          ) : (
            <div className="divide-y">
              {reminderLogs.map(log => {
                const reminderDate = log.reminderDays
                  ? new Date(
                      new Date(log.dateTime).getTime() +
                        log.reminderDays *
                          24 *
                          60 *
                          60 *
                          1000
                    )
                  : null;

                const phase =
                  reminderDate && reminderDate < new Date()
                    ? 'OVERDUE'
                    : reminderDate
                    ? 'UPCOMING'
                    : null;

                return (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {log.client.clientName}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {log.callRegarding}
                        </span>

                        {phase && (
                          <Badge
                            variant={
                              phase === 'OVERDUE'
                                ? 'destructive'
                                : 'secondary'
                            }
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
                      onClick={() =>
                        handleReLog(log)
                      }
                    >
                      Re-Log Call
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =========================
            CALL LOG MODAL
        ========================= */}

        <CallLogModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

      </div>
    </DashboardLayout>
  );
}
