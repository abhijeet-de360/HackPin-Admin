import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PinSetupDialog } from './PinSetupDialog';
import { PinUnlockScreen } from './PinUnlockScreen';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLocked, needsPinSetup } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {children}
      {needsPinSetup && <PinSetupDialog />}
      {isLocked && <PinUnlockScreen />}
    </>
  );
};
