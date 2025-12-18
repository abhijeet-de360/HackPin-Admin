import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export const PinSetupDialog = () => {
  const { needsPinSetup, setupPin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setupPin(pin);
    toast({
      title: 'PIN created successfully',
      description: 'You can now use this PIN for quick access',
    });
  };

  return (
    <Dialog open={needsPinSetup}>
      <DialogContent hideClose className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Your PIN</DialogTitle>
          <DialogDescription>
            Create a 6-digit PIN for quick access to the app. This is mandatory for security.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Enter PIN (6 digits)</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPin(value);
                setError('');
              }}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input
              id="confirmPin"
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

          <Button type="submit" className="w-full">
            Create PIN
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
