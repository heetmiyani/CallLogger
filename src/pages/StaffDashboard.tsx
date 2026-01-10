import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientSearch from '@/components/staff/ClientSearch';
import CallLogModal from '@/components/staff/CallLogModal';
import RecentCallsTable from '@/components/dashboard/RecentCallsTable';
import StatsCard from '@/components/dashboard/StatsCard';
import { Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { PhoneCall, PhoneOff, TrendingUp } from 'lucide-react';

export default function StaffDashboard() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { callLogs } = useData();

  const myLogs = callLogs.filter(log => log.staffId === user?.id);
  const todayLogs = myLogs.filter(log => {
    const logDate = new Date(log.dateTime).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  });

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
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">Search for clients and log your calls</p>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <StatsCard
            title="Calls Today"
            value={todayLogs.length}
            icon={PhoneCall}
            variant="default"
          />
          <StatsCard
            title="Answered Today"
            value={todayLogs.filter(l => l.status === 'Answered').length}
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Not Answered"
            value={todayLogs.filter(l => l.status === 'Not Answered').length}
            icon={PhoneOff}
            variant="warning"
          />
        </div>

        {/* Client Search */}
        <ClientSearch onSelectClient={handleSelectClient} />

        {/* Recent Calls (My Logs) */}
        <RecentCallsTable limit={5} showStaff={false} filterByStaff={user?.id} />

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
