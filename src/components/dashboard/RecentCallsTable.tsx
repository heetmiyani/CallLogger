import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface RecentCallsTableProps {
  limit?: number;
  showStaff?: boolean;
  filterByStaff?: number; // 🔥 staffId is now number
}

export default function RecentCallsTable({
  limit = 5,
  showStaff = true,
  filterByStaff,
}: RecentCallsTableProps) {
  const { callLogs } = useData();

  // 🔥 staffId is number in Prisma
  let filteredLogs = filterByStaff
    ? callLogs.filter(log => log.staffId === filterByStaff)
    : callLogs;

  const recentLogs = filteredLogs.slice(0, limit);

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Calls
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Client
              </th>
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Category
              </th>
              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Status
              </th>

              {showStaff && (
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                  Staff
                </th>
              )}

              <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">
                Date & Time
              </th>
            </tr>
          </thead>

          <tbody>
            {recentLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                {/* 🔥 FIXED CLIENT */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {log.client?.clientName || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.client?.clientCode || ''}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <Badge
                    variant={
                      log.callRegarding === 'Mutual Funds'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {log.callRegarding}
                  </Badge>
                </td>

                <td className="px-6 py-4">
                  <Badge
                    variant="outline"
                    className={
                      log.status === 'Answered'
                        ? 'border-success text-success bg-success/10'
                        : 'border-destructive text-destructive bg-destructive/10'
                    }
                  >
                    {log.status}
                  </Badge>
                </td>

                {/* 🔥 FIXED STAFF */}
                {showStaff && (
                  <td className="px-6 py-4 text-sm text-foreground">
                    {log.staff?.name || 'N/A'}
                  </td>
                )}

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {format(
                    new Date(log.dateTime),
                    'MMM dd, yyyy HH:mm'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
