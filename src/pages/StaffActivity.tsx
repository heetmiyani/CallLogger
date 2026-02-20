import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import { User } from '@/types';

export default function StaffActivity() {
  const { callLogs = [] } = useData();

  const [staffMembers, setStaffMembers] = useState<User[]>([]);

  /* =========================
     LOAD STAFF FROM DB
  ========================= */

  useEffect(() => {
    fetch('/api/staff')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch staff');
        return res.json();
      })
      .then(data => {
        const staffOnly = data.filter(
          (u: User) => u.role === 'staff'
        );
        setStaffMembers(staffOnly);
      })
      .catch(err =>
        console.error('Staff load failed:', err)
      );
  }, []);

  /* =========================
     CALCULATE STAFF STATS
  ========================= */

  const staffStats = staffMembers.map(staff => {
    const staffLogs = callLogs.filter(
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

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Staff Activity
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor staff performance and call metrics
          </p>
        </div>

        {/* Staff Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffStats.map(staff => (
            <div
              key={staff.name}
              className="bg-card rounded-xl p-6 shadow-card border border-border/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-foreground">
                    {staff.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {staff.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Staff Member
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {staff.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Calls
                  </p>
                </div>

                <div className="p-3 bg-success/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-success">
                    {staff.answerRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Answer Rate
                  </p>
                </div>

                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">
                    {staff.mutualFunds}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mutual Funds
                  </p>
                </div>

                <div className="p-3 bg-accent/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-accent">
                    {staff.trading}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Trading
                  </p>
                </div>
              </div>
            </div>
          ))}

          {staffStats.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">
              No staff activity data available
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Staff Performance Comparison
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="answered"
                  name="Answered"
                  fill="hsl(142, 71%, 45%)"
                />
                <Bar
                  dataKey="notAnswered"
                  name="Not Answered"
                  fill="hsl(0, 84%, 60%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
