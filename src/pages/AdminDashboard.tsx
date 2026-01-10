import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import CallChart from '@/components/dashboard/CallChart';
import RecentCallsTable from '@/components/dashboard/RecentCallsTable';
import { Button } from '@/components/ui/button';
import { PhoneCall, PhoneOff, TrendingUp, Users, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { callLogs } = useData();
  const { toast } = useToast();

  const totalCalls = callLogs.length;
  const answeredCalls = callLogs.filter(log => log.status === 'Answered').length;
  const notAnsweredCalls = callLogs.filter(log => log.status === 'Not Answered').length;
  const answerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0;

  const handleExport = () => {
    // Create CSV content
    const headers = ['Client Code', 'Client Name', 'Phone', 'Category', 'Status', 'Response', 'Staff', 'Date Time'];
    const rows = callLogs.map(log => [
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

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Call logs have been downloaded as CSV.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of all call activities</p>
          </div>
          <Button variant="accent" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total Calls"
            value={totalCalls}
            icon={PhoneCall}
            variant="default"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Answered"
            value={answeredCalls}
            icon={TrendingUp}
            variant="success"
            subtitle={`${answerRate}% answer rate`}
          />
          <StatsCard
            title="Not Answered"
            value={notAnsweredCalls}
            icon={PhoneOff}
            variant="warning"
          />
          <StatsCard
            title="Active Staff"
            value={3}
            icon={Users}
            variant="accent"
            subtitle="Online today"
          />
        </div>

        {/* Charts */}
        <CallChart />

        {/* Recent Calls Table */}
        <RecentCallsTable limit={10} showStaff={true} />
      </div>
    </DashboardLayout>
  );
}
