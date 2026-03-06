import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Search, Download } from 'lucide-react';
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

  const [allLogs, setAllLogs] = useState<CallLogType[]>([]);
  const [logs, setLogs] = useState<CallLogType[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [filter, setFilter] = useState<
    'today' | '7days' | '30days' | 'month' | 'overall' | 'custom'
  >('today');

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  /* NEW FILTERS */

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [interestFilter, setInterestFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch('/api/call-logs')
      .then(res => res.json())
      .then(data => setAllLogs(data))
      .catch(err =>
        console.error('Call logs fetch failed:', err)
      );
  }, []);

  /* ================= FILTERING ================= */

  useEffect(() => {
    const now = new Date();

    let filtered = [...allLogs];

    /* SEARCH */

    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      filtered = filtered.filter(log =>
        log.client?.clientName?.toLowerCase().includes(q) ||
        log.client?.clientCode?.toLowerCase().includes(q)
      );
    }

    /* DATE FILTER */

    filtered = filtered.filter(log => {
      const logDate = new Date(log.dateTime);

      if (filter === 'today') {
        return logDate.toDateString() === now.toDateString();
      }

      if (filter === '7days') {
        const past = new Date();
        past.setDate(now.getDate() - 7);
        return logDate >= past;
      }

      if (filter === '30days') {
        const past = new Date();
        past.setDate(now.getDate() - 30);
        return logDate >= past;
      }

      if (filter === 'month') {
        return (
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        );
      }

      if (filter === 'custom' && customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);

        return logDate >= start && logDate <= end;
      }

      return true;
    });

    /* CATEGORY FILTER */

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        log => log.callRegarding === categoryFilter
      );
    }

    /* STATUS FILTER */

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        log => log.status === statusFilter
      );
    }

    /* INTEREST FILTER */

    if (interestFilter !== 'all') {
      filtered = filtered.filter(
        log => log.interestStatus === interestFilter
      );
    }

    /* STAFF FILTER */

    if (staffFilter !== 'all') {
      filtered = filtered.filter(
        log => log.staff?.name === staffFilter
      );
    }

    setLogs(filtered);

  }, [
    searchQuery,
    filter,
    customStart,
    customEnd,
    categoryFilter,
    statusFilter,
    interestFilter,
    staffFilter,
    allLogs,
  ]);

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

  /* ================= UNIQUE STAFF ================= */

  const staffList = Array.from(
    new Set(allLogs.map(log => log.staff?.name).filter(Boolean))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}

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

        {/* SEARCH */}

        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Search by client name or client code..."
            value={searchQuery}
            onChange={e =>
              setSearchQuery(e.target.value)
            }
          />
        </div>

        {/* DATE FILTERS */}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filter === 'today' ? 'default' : 'outline'} onClick={() => setFilter('today')}>Today</Button>
          <Button size="sm" variant={filter === '7days' ? 'default' : 'outline'} onClick={() => setFilter('7days')}>Last 7 Days</Button>
          <Button size="sm" variant={filter === '30days' ? 'default' : 'outline'} onClick={() => setFilter('30days')}>Last 30 Days</Button>
          <Button size="sm" variant={filter === 'month' ? 'default' : 'outline'} onClick={() => setFilter('month')}>This Month</Button>
          <Button size="sm" variant={filter === 'overall' ? 'default' : 'outline'} onClick={() => setFilter('overall')}>Overall</Button>
          <Button size="sm" variant={filter === 'custom' ? 'default' : 'outline'} onClick={() => setFilter('custom')}>Custom Range</Button>
        </div>

        {/* ADVANCED FILTERS */}

        <div className="flex flex-wrap gap-3">

          <select onChange={e=>setCategoryFilter(e.target.value)} className="border rounded px-3 py-1">
            <option value="all">All Categories</option>
            <option value="Mutual Funds">Mutual Funds</option>
            <option value="Trading">Trading</option>
          </select>

          <select onChange={e=>setStatusFilter(e.target.value)} className="border rounded px-3 py-1">
            <option value="all">All Status</option>
            <option value="Answered">Answered</option>
            <option value="Not Answered">Not Answered</option>
          </select>

          <select onChange={e=>setInterestFilter(e.target.value)} className="border rounded px-3 py-1">
            <option value="all">All Interest</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
          </select>

          <select onChange={e=>setStaffFilter(e.target.value)} className="border rounded px-3 py-1">
            <option value="all">All Staff</option>

            {staffList.map(staff=>(
              <option key={staff}>{staff}</option>
            ))}

          </select>

        </div>

        {/* TABLE remains same */}

      </div>
    </DashboardLayout>
  );
}