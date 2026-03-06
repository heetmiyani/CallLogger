import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

import { User } from '@/types';

export default function StaffActivity() {
  const { callLogs = [] } = useData();
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [filter, setFilter] = useState('overall');

  /* =========================
     LOAD STAFF
  ========================= */

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        const staffOnly = data.filter((u: User) => u.role === 'staff');
        setStaffMembers(staffOnly);
      });
  }, []);

  /* =========================
     FILTER LOGIC
  ========================= */

  const now = new Date();

  const filteredLogs = callLogs.filter(log => {
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

    return true;
  });

  /* =========================
     STAFF STATS
  ========================= */

  const staffStats = staffMembers.map(staff => {
    const staffLogs = filteredLogs.filter(
      log => log.staff?.name === staff.name
    );

    const answered = staffLogs.filter(
      log => log.status === 'Answered'
    ).length;

    const notAnswered = staffLogs.filter(
      log => log.status === 'Not Answered'
    ).length;

    const mutualFunds = staffLogs.filter(
      log => log.callRegarding === 'Mutual Funds'
    ).length;

    const trading = staffLogs.filter(
      log => log.callRegarding === 'Trading'
    ).length;

    return {
      name: staff.name,
      total: staffLogs.length,
      answered,
      notAnswered,
      mutualFunds,
      trading,
      answerRate:
        staffLogs.length > 0
          ? Math.round((answered / staffLogs.length) * 100)
          : 0,
    };
  });

  /* =========================
     OVERALL TOTALS
  ========================= */

  const totalCalls = staffStats.reduce((sum, s) => sum + s.total, 0);
  const totalAnswered = staffStats.reduce((sum, s) => sum + s.answered, 0);
  const totalNotAnswered = staffStats.reduce((sum, s) => sum + s.notAnswered, 0);
  const totalMutualFunds = staffStats.reduce((sum, s) => sum + s.mutualFunds, 0);

  const overallAnswerRate =
    totalCalls > 0
      ? Math.round((totalAnswered / totalCalls) * 100)
      : 0;

  const topPerformer = [...staffStats].sort((a, b) => b.total - a.total)[0];

  /* =========================
     CATEGORY DATA
  ========================= */

  const categoryMap: any = {};

  filteredLogs.forEach(log => {
    const cat = log.callRegarding || 'Other';
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat]++;
  });

  const categoryStats = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key],
  }));

  /* =========================
     DAILY TREND
  ========================= */

  const dayMap: any = {};

  filteredLogs.forEach(log => {
    const day = new Date(log.dateTime).toLocaleDateString();
    if (!dayMap[day]) dayMap[day] = 0;
    dayMap[day]++;
  });

  const trendData = Object.keys(dayMap).map(day => ({
    day,
    calls: dayMap[day],
  }));

  /* =========================
     CALLS BY HOUR
  ========================= */

  const hourMap: any = {};

  filteredLogs.forEach(log => {
    const hour = new Date(log.dateTime).getHours();
    if (!hourMap[hour]) hourMap[hour] = 0;
    hourMap[hour]++;
  });

  const hourData = Object.keys(hourMap).map(hour => ({
    hour: `${hour}:00`,
    calls: hourMap[hour],
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">

        {/* Header */}

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Staff Activity
          </h1>
          <p className="text-muted-foreground">
            Monitor staff performance and call metrics
          </p>
        </div>

        {/* Filters */}

        <div className="flex flex-wrap gap-2">
          <Button variant={filter==='today'?'default':'outline'} onClick={()=>setFilter('today')}>Today</Button>
          <Button variant={filter==='7days'?'default':'outline'} onClick={()=>setFilter('7days')}>Last 7 Days</Button>
          <Button variant={filter==='30days'?'default':'outline'} onClick={()=>setFilter('30days')}>Last 30 Days</Button>
          <Button variant={filter==='month'?'default':'outline'} onClick={()=>setFilter('month')}>This Month</Button>
          <Button variant={filter==='overall'?'default':'outline'} onClick={()=>setFilter('overall')}>Overall</Button>
        </div>

        {/* Summary Cards */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SummaryCard label="Total Calls" value={totalCalls} />
          <SummaryCard label="Answered" value={totalAnswered} />
          <SummaryCard label="Not Answered" value={totalNotAnswered} />
          <SummaryCard label="Answer Rate" value={`${overallAnswerRate}%`} />
          <SummaryCard label="Mutual Funds" value={totalMutualFunds} />
        </div>

        {/* Top Performer */}

        {topPerformer && (
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
            <p className="font-semibold">
              🏆 Top Performer: {topPerformer.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {topPerformer.total} calls | {topPerformer.answerRate}% answer rate
            </p>
          </div>
        )}

        {/* Staff Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffStats.map(staff => (
            <div key={staff.name} className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <h3 className="font-semibold mb-4">{staff.name}</h3>

              <div className="space-y-2 text-sm">
                <p>Total Calls: <strong>{staff.total}</strong></p>
                <p>Answered: <strong>{staff.answered}</strong></p>
                <p>Not Answered: <strong>{staff.notAnswered}</strong></p>
                <p>Answer Rate: <strong>{staff.answerRate}%</strong></p>
                <p>Mutual Funds: <strong>{staff.mutualFunds}</strong></p>
                <p>Trading: <strong>{staff.trading}</strong></p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}

        <AnalyticsCharts
          staffStats={staffStats}
          categoryStats={categoryStats}
          trendData={trendData}
          hourData={hourData}
        />

      </div>
    </DashboardLayout>
  );
}

/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/* =========================
   ANALYTICS CHART SECTION
========================= */

function AnalyticsCharts({ staffStats, categoryStats, trendData, hourData }: any) {
  return (
    <>
      {/* Staff Performance */}
      <ChartCard title="Staff Performance Comparison">
        <BarChart data={staffStats}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="name"/>
          <YAxis/>
          <Tooltip/>
          <Legend/>
          <Bar dataKey="answered" fill="#22c55e"/>
          <Bar dataKey="notAnswered" fill="#ef4444"/>
        </BarChart>
      </ChartCard>

      {/* Category Distribution */}
      <ChartCard title="Call Category Distribution">
        <PieChart>
          <Pie data={categoryStats} dataKey="value" nameKey="name" outerRadius={120} label>
            {categoryStats.map((e:any,i:number)=><Cell key={i}/>)}
          </Pie>
          <Tooltip/>
        </PieChart>
      </ChartCard>

      {/* Daily Trend */}
      <ChartCard title="Daily Call Trend">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="day"/>
          <YAxis/>
          <Tooltip/>
          <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3}/>
        </LineChart>
      </ChartCard>

      {/* Calls by Hour */}
      <ChartCard title="Calls by Hour">
        <BarChart data={hourData}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="hour"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="calls" fill="#6366f1"/>
        </BarChart>
      </ChartCard>
    </>
  );
}

/* =========================
   GENERIC CHART CARD
========================= */

function ChartCard({ title, children }: any) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}