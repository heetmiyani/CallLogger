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
import { Client, CallLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Hash, Loader2 } from 'lucide-react';

interface CallLogModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

const CALL_CATEGORIES: CallLog['callRegarding'][] = [
  'Trading',
  'Mutual Funds',
  'IPO',
  'MTF',
  'FNO',
  'DP Dues',
  'SLBM',
  'Back office',
];

export default function CallLogModal({
  client,
  isOpen,
  onClose,
}: CallLogModalProps) {
  const [callRegarding, setCallRegarding] =
    useState<CallLog['callRegarding'] | undefined>(undefined);

  const [status, setStatus] =
    useState<CallLog['status'] | undefined>(undefined);

  const [interestStatus, setInterestStatus] =
    useState<CallLog['interestStatus'] | undefined>(undefined);

  const [reminderDays, setReminderDays] =
    useState<number | undefined>(undefined);

  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { addCallLog } = useData();
  const { toast } = useToast();

  const currentDateTime = new Date();

  if (!client || !user) return null;

  const handleSubmit = async () => {
    if (!callRegarding || !status) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (status === 'Answered') {
      if (!interestStatus) {
        toast({
          title: 'Error',
          description: 'Please select interest',
          variant: 'destructive',
        });
        return;
      }

      if (
        interestStatus === 'Interested' &&
        (!reminderDays || reminderDays <= 0)
      ) {
        toast({
          title: 'Error',
          description: 'Please enter valid reminder days',
          variant: 'destructive',
        });
        return;
      }

      if (!response.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter the client response',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newLog: Omit<CallLog, 'id'> = {
      clientCode: String(client.clientCode),
      clientName: client.clientName,
      phoneNumber: client.phoneNumber,
      callRegarding,
      status,
      interestStatus:
        status === 'Answered'
          ? interestStatus!
          : 'Not Interested',
      reminderDays:
        status === 'Answered' && interestStatus === 'Interested'
          ? reminderDays
          : undefined,
      response: status === 'Answered' ? response : undefined,
      dateTime: currentDateTime.toISOString(),
      staffName: user.name,
    };

    addCallLog(newLog);

    toast({
      title: 'Success!',
      description: 'Call log has been saved successfully.',
    });

    handleClose();
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setCallRegarding(undefined);
    setStatus(undefined);
    setInterestStatus(undefined);
    setReminderDays(undefined);
    setResponse('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Log Call Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">{client.clientName}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            <Select
              value={callRegarding}
              onValueChange={value =>
                setCallRegarding(value as CallLog['callRegarding'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CALL_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span>{format(currentDateTime, 'MMMM dd, yyyy')}</span>
              <Clock className="w-5 h-5 ml-4" />
              <span>{format(currentDateTime, 'HH:mm:ss')}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={status}
              onValueChange={value =>
                setStatus(value as CallLog['status'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Answered">Answered</SelectItem>
                <SelectItem value="Not Answered">Not Answered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Answered-only fields */}
          {status === 'Answered' && (
            <>
              {/* Interest */}
              <div className="space-y-2">
                <Label>Interest *</Label>
                <Select
                  value={interestStatus}
                  onValueChange={value =>
                    setInterestStatus(
                      value as CallLog['interestStatus']
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Not Interested">
                      Not Interested
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reminder */}
              {interestStatus === 'Interested' && (
                <div className="space-y-2">
                  <Label>Reminder (Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 10"
                    value={reminderDays ?? ''}
                    onChange={e =>
                      setReminderDays(Number(e.target.value))
                    }
                  />
                </div>
              )}

              {/* Response */}
              <div className="space-y-2">
                <Label>Client Response *</Label>
                <Textarea
                  placeholder="Enter the client's response..."
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
