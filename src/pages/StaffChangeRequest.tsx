import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function StaffChangeRequest() {
  const { user } = useAuth();
  const { clients } = useData();
  const { toast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [field, setField] = useState('');
  const [newValue, setNewValue] = useState('');

  const selectedClient = clients.find(
    c => c.id === selectedClientId
  );

  const handleSubmit = async () => {
    if (!selectedClient || !field || !newValue) {
      toast({
        title: 'Error',
        description: 'All fields required',
        variant: 'destructive',
      });
      return;
    }

    const oldValue = selectedClient[field as keyof typeof selectedClient];

    await fetch('/api/change-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: selectedClient.id,
        field,
        oldValue,
        newValue,
        requestedBy: user?.id,
      }),
    });

    toast({
      title: 'Request Submitted',
      description: 'Waiting for admin approval.',
    });

    setField('');
    setNewValue('');
    setSelectedClientId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Create Change Request
        </h1>

        <Select
          onValueChange={value =>
            setSelectedClientId(Number(value))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem
                key={client.id}
                value={String(client.id)}
              >
                {client.clientName} ({client.clientCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setField}>
          <SelectTrigger>
            <SelectValue placeholder="Select Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clientName">
              Client Name
            </SelectItem>
            <SelectItem value="phoneNumber">
              Phone Number
            </SelectItem>
            <SelectItem value="clientCode">
              Client Code
            </SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Enter new value"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
        />

        <Button onClick={handleSubmit}>
          Submit Change Request
        </Button>
      </div>
    </DashboardLayout>
  );
}
