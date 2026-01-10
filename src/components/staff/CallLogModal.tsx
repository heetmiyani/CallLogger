import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function CallLogModal({ client, isOpen, onClose }: CallLogModalProps) {
  const [callRegarding, setCallRegarding] = useState<'Mutual Funds' | 'Trading' | ''>('');
  const [status, setStatus] = useState<'Answered' | 'Not Answered' | ''>('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { addCallLog } = useData();
  const { toast } = useToast();

  const currentDateTime = new Date();

  const handleSubmit = async () => {
    if (!callRegarding || !status || !client || !user) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (status === 'Answered' && !response.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the client response',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newLog: Omit<CallLog, 'id'> = {
      clientCode: client.clientCode,
      clientName: client.clientName,
      phoneNumber: client.phoneNumber,
      callRegarding,
      status,
      response: status === 'Answered' ? response : undefined,
      dateTime: currentDateTime.toISOString(),
      staffId: user.id,
      staffName: user.name,
    };

    addCallLog(newLog);

    toast({
      title: 'Success!',
      description: 'Call log has been saved successfully.',
    });

    // Reset form
    setCallRegarding('');
    setStatus('');
    setResponse('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setCallRegarding('');
    setStatus('');
    setResponse('');
    onClose();
  };

  if (!client) return null;

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
                <p className="font-semibold text-foreground">{client.clientName}</p>
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
              onValueChange={(value: 'Mutual Funds' | 'Trading') => setCallRegarding(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                <SelectItem value="Trading">Trading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time (Locked) */}
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
              onValueChange={(value: 'Answered' | 'Not Answered') => setStatus(value)}
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

          {/* Response (only if Answered) */}
          {status === 'Answered' && (
            <div className="space-y-2 animate-fade-in">
              <Label>Client Response *</Label>
              <Textarea
                placeholder="Enter the client's response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSubmit} disabled={isSubmitting}>
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
