import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ChangePinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePinDialog = ({ open, onOpenChange }: ChangePinDialogProps) => {
  const { currentUser, updatePin } = useAuth();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) return;

    if (currentPin !== currentUser.pin) {
      setError('Current PIN is incorrect');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setError('PIN must contain only numbers');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }

    if (newPin === currentPin) {
      setError('New PIN must be different from current PIN');
      return;
    }
                                  
    updatePin(newPin);
    toast({
      title: 'PIN changed successfully',
      description: 'Your new PIN is now active',
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='text-center'>Change PIN</DialogTitle>
          {/* <DialogDescription>
            Update your 6-digit PIN for quick access
          </DialogDescription> */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPin">Current PIN</Label>
            <Input
              id="currentPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={currentPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCurrentPin(value);
                setError('');
              }}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPin">New PIN</Label>
            <Input
              id="newPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={newPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setNewPin(value);
                setError('');
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPin">Confirm New PIN</Label>
            <Input
              id="confirmNewPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={confirmPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setConfirmPin(value);
                setError('');
              }}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive animate-fade-in">{error}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Change PIN
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
