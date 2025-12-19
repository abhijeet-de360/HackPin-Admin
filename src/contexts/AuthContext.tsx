import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import usersData from '@/data/users.json';

interface AuthContextType {
  currentUser: User | null;
  isLocked: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
  updatePin: (newPin: string) => void;
  needsPinSetup: boolean;
  setupPin: (pin: string) => void;
  getLoggedInUsers: () => User[];
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'kajal_current_user',
  IS_LOCKED: 'kajal_is_locked',
  LAST_ACTIVITY: 'kajal_last_activity',
  LOGGED_IN_USERS: 'kajal_logged_in_users',
};

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const savedIsLocked = localStorage.getItem(STORAGE_KEYS.IS_LOCKED) === 'true';
    
    if (savedUserId) {
      const user = usersData.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
        setIsLocked(savedIsLocked);
        
        // Check if enough time has passed to auto-lock
        const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
          if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
            setIsLocked(true);
            localStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'true');
          }
        }
      }
    }
  }, []);
 
  const updateActivity = useCallback(() => {
    if (currentUser && !isLocked) {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }
  }, [currentUser, isLocked]);

  // Track user activity
  useEffect(() => {
    if (!currentUser || isLocked) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Check inactivity every minute
    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
          setIsLocked(true);
          localStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'true');
        }
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [currentUser, isLocked, updateActivity]);

  const login = (email: string, password: string): boolean => {
    const user = usersData.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.id);
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
      
      // Add user to logged-in users list
      const loggedInUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGGED_IN_USERS) || '[]');
      if (!loggedInUsers.includes(user.id)) {
        loggedInUsers.push(user.id);
        localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USERS, JSON.stringify(loggedInUsers));
      }
      
      // Check if PIN needs setup (if PIN is empty or default)
      if (!user.pin || user.pin.length !== 6) {
        setNeedsPinSetup(true);
      } else {
        setIsLocked(false);
        localStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'false');
      }
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLocked(false);
    setNeedsPinSetup(false);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  };

  const unlockWithPin = (pin: string): boolean => {
    if (currentUser && currentUser.pin === pin) {
      setIsLocked(false);
      localStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'false');
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setIsLocked(true);
    localStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'true');
  };

  const setupPin = (pin: string) => {
    if (currentUser && pin.length === 6) {
      const updatedUser = { ...currentUser, pin };
      setCurrentUser(updatedUser);
      setNeedsPinSetup(false);
      setIsLocked(false);
      localStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'false');
      
      // In a real app, this would save to backend
      // For demo, we'll just update localStorage with a custom user data
      const customUsers = JSON.parse(localStorage.getItem('kajal_custom_users') || '{}');
      customUsers[currentUser.id] = updatedUser;
      localStorage.setItem('kajal_custom_users', JSON.stringify(customUsers));
    }
  };

  const updatePin = (newPin: string) => {
    if (currentUser && newPin.length === 6) {
      const updatedUser = { ...currentUser, pin: newPin };
      setCurrentUser(updatedUser);
      
      // Update in custom users storage
      const customUsers = JSON.parse(localStorage.getItem('kajal_custom_users') || '{}');
      customUsers[currentUser.id] = updatedUser;
      localStorage.setItem('kajal_custom_users', JSON.stringify(customUsers));
    }
  };

  const getLoggedInUsers = (): User[] => {
    const loggedInUserIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGGED_IN_USERS) || '[]');
    const customUsers = JSON.parse(localStorage.getItem('kajal_custom_users') || '{}');
    
    // Get all users from JSON and merge with custom updates
    return usersData.map((user) => {
      // Check if user has custom data (updated PIN)
      if (customUsers[user.id]) {
        return customUsers[user.id];
      }
      return user;
    }).filter(Boolean);
  };

  const switchUser = (userId: string) => {
    const customUsers = JSON.parse(localStorage.getItem('kajal_custom_users') || '{}');
    let user = customUsers[userId] || usersData.find(u => u.id === userId);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.id);
      setIsLocked(true);
      localStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'true');
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLocked,
        isAuthenticated: !!currentUser,
        login,
        logout,
        unlockWithPin,
        lockApp,
        updatePin,
        needsPinSetup,
        setupPin,
        getLoggedInUsers,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
