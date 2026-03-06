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
    return {
      name: staff.name,
      total: staffLogs.length,
      answered,
      notAnswered,
      answerRate:
        staffLogs.length > 0
          ? Math.round((answered / staffLogs.length) * 100)
          : 0,
    };
  });

  /* =========================
     CATEGORY STATS
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

        {/* HEADER */}

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Staff Activity
          </h1>
          <p className="text-muted-foreground">
            Monitor staff performance and call metrics
          </p>
        </div>

        {/* FILTER BUTTONS */}

        <div className="flex flex-wrap gap-2">
          <Button variant={filter==='today'?'default':'outline'} onClick={()=>setFilter('today')}>Today</Button>
          <Button variant={filter==='7days'?'default':'outline'} onClick={()=>setFilter('7days')}>Last 7 Days</Button>
          <Button variant={filter==='30days'?'default':'outline'} onClick={()=>setFilter('30days')}>Last 30 Days</Button>
          <Button variant={filter==='month'?'default':'outline'} onClick={()=>setFilter('month')}>This Month</Button>
          <Button variant={filter==='overall'?'default':'outline'} onClick={()=>setFilter('overall')}>Overall</Button>
        </div>

        {/* =========================
            STAFF PERFORMANCE
        ========================= */}

        <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
          <h3 className="text-lg font-semibold mb-6">
            Staff Performance Comparison
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>

                <Bar dataKey="answered" fill="#22c55e"/>
                <Bar dataKey="notAnswered" fill="#ef4444"/>

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* =========================
            CATEGORY DISTRIBUTION
        ========================= */}

        <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
          <h3 className="text-lg font-semibold mb-6">
            Call Category Distribution
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={categoryStats}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={index}/>
                  ))}
                </Pie>

                <Tooltip/>

              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* =========================
            DAILY CALL TREND
        ========================= */}

        <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
          <h3 className="text-lg font-semibold mb-6">
            Daily Call Trend
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>

                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="day"/>
                <YAxis/>
                <Tooltip/>

                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />

              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* =========================
            CALLS BY HOUR
        ========================= */}

        <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
          <h3 className="text-lg font-semibold mb-6">
            Calls by Hour
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>

                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="hour"/>
                <YAxis/>
                <Tooltip/>

                <Bar dataKey="calls" fill="#6366f1"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}