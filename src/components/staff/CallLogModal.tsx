import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext'; // ✅ IMPORTANT
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Hash, Loader2 } from 'lucide-react';

interface CallLogModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallLogModal({
  client,
  isOpen,
  onClose,
}: CallLogModalProps) {
  const [callRegarding, setCallRegarding] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [interestStatus, setInterestStatus] = useState<string>();
  const [reminderDays, setReminderDays] = useState<number>();
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { addCallLog } = useData(); // ✅ USE CONTEXT
  const { toast } = useToast();

  if (!client || !user) return null;

  const handleSubmit = async () => {
    if (!callRegarding || !status) {
      toast({
        title: 'Error',
        description: 'Please fill required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Use DataContext function instead of fetch
      await addCallLog({
        clientId: client.id,
        staffId: user.id,
        callRegarding,
        status,
        interestStatus:
          status === 'Answered'
            ? interestStatus
            : 'Not Interested',
        reminderDays:
          status === 'Answered' &&
          interestStatus === 'Interested'
            ? reminderDays
            : null,
        response:
          status === 'Answered'
            ? response
            : null,
      });

      toast({
        title: 'Success!',
        description: 'Call log saved successfully.',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.message || 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Call Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Client Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">
                  {client.clientName}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {client.clientCode}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {client.phoneNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Call Regarding */}
          <div className="space-y-2">
            <Label>Call Regarding *</Label>
            <Select onValueChange={setCallRegarding}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Trading">Trading</SelectItem>
                <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                <SelectItem value="IPO">IPO</SelectItem>
                <SelectItem value="MTF">MTF</SelectItem>
                <SelectItem value="FNO">FNO</SelectItem>
                <SelectItem value="DP Dues">DP Dues</SelectItem>
                <SelectItem value="SLBM">SLBM</SelectItem>
                <SelectItem value="Back office">Back office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Answered">Answered</SelectItem>
                <SelectItem value="Not Answered">Not Answered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Answered Section */}
          {status === 'Answered' && (
            <>
              <div className="space-y-2">
                <Label>Interest</Label>
                <Select onValueChange={setInterestStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interested">
                      Interested
                    </SelectItem>
                    <SelectItem value="Not Interested">
                      Not Interested
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {interestStatus === 'Interested' && (
                <div className="space-y-2">
                  <Label>Reminder (Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    onChange={e =>
                      setReminderDays(
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Client Response</Label>
                <Textarea
                  value={response}
                  onChange={e =>
                    setResponse(e.target.value)
                  }
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Call Log'
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}