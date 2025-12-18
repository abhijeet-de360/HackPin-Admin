import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const PinUnlockScreen = () => {
  const { currentUser, unlockWithPin, logout, getLoggedInUsers, switchUser } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    const success = unlockWithPin(pin);
    
    if (success) {
      setError('');
      setFailedAttempts(0);
      setPin('');
    } else {
      setError('Incorrect PIN');
      setFailedAttempts(prev => prev + 1);
      setPin('');
      
      // Shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    setShowUserList(false);
    setPin('');
    setError('');
  };

  const handleAddAccount = () => {
    logout();
    navigate('/auth');
  };

  if (!currentUser) return null;

  const loggedInUsers = getLoggedInUsers();

  const getInitials = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className={`w-full max-w-md space-y-8 px-4 ${shake ? 'animate-shake' : ''}`}>
        {!showUserList ? (
          <>
            <div className="text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto border-4 border-gray-200 bg-white">
                <AvatarFallback className="text-3xl bg-white text-gray-600 font-bold">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-semibold">{currentUser.name}</h2>
                <p className="text-muted-foreground mt-1">Enter your PIN to unlock</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPin(value);
                    setError('');
                  }}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="text-center space-y-1">
                  <p className="text-sm text-destructive animate-fade-in">{error}</p>
                  {failedAttempts > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Failed attempts: {failedAttempts}
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setShowUserList(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use different account
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <p className="text-sm font-medium">Switch Account</p>
            </div>
            
            <div className="space-y-2">
              {loggedInUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                >
                  <Avatar className="h-10 w-10 border-2 border-gray-200 bg-white">
                    <AvatarFallback className="bg-white text-gray-600 font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleAddAccount}
                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/5">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium text-sm text-primary">Add Account</p>
              </button>
            </div>
            
            <div className="text-center pt-2">
              <button
                onClick={() => setShowUserList(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
