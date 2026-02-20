import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminManageData() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    const res = await fetch('/api/change-requests');
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approve = async (id: number) => {
    await fetch('/api/change-requests-approve', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id }),
    });

    toast({
      title: 'Approved',
    });

    fetchRequests();
  };

  const reject = async (id: number) => {
    await fetch('/api/change-requests-reject', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id }),
    });

    toast({
      title: 'Rejected',
      variant: 'destructive',
    });

    fetchRequests();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Manage Change Requests
        </h1>

        {requests.map(req => (
          <div
            key={req.id}
            className="p-4 border rounded-lg space-y-2"
          >
            <p>
              <b>Client:</b> {req.client.clientName}
            </p>
            <p>
              <b>Field:</b> {req.field}
            </p>
            <p>
              <b>Old:</b> {req.oldValue}
            </p>
            <p>
              <b>New:</b> {req.newValue}
            </p>
            <p>
              <b>Requested By:</b> {req.staff.name}
            </p>

            <Badge>{req.status}</Badge>

            {req.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button onClick={() => approve(req.id)}>
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => reject(req.id)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
