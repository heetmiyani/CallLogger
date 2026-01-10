import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useData } from '@/contexts/DataContext';

export default function CallChart() {
  const { callLogs } = useData();

  const statusData = [
    { 
      name: 'Answered', 
      value: callLogs.filter(log => log.status === 'Answered').length,
      color: 'hsl(142, 71%, 45%)'
    },
    { 
      name: 'Not Answered', 
      value: callLogs.filter(log => log.status === 'Not Answered').length,
      color: 'hsl(0, 84%, 60%)'
    },
  ];

  const categoryData = [
    { 
      name: 'Mutual Funds', 
      value: callLogs.filter(log => log.callRegarding === 'Mutual Funds').length,
      color: 'hsl(222, 47%, 20%)'
    },
    { 
      name: 'Trading', 
      value: callLogs.filter(log => log.callRegarding === 'Trading').length,
      color: 'hsl(187, 72%, 42%)'
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Call Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Call Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
