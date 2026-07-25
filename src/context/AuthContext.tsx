import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { BusinessSettings } from '../types';
import { getBusinessSettings } from '../services/settingsService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  settings: BusinessSettings | null;
  refreshSettings: () => Promise<void>;
  isGuestMode: boolean;
  enableGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  settings: null,
  refreshSettings: async () => {},
  isGuestMode: false,
  enableGuestMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsGuestMode(false);
        const userSettings = await getBusinessSettings(firebaseUser.uid);
        setSettings(userSettings);
      } else {
        setSettings(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshSettings = async () => {
    if (user) {
      const userSettings = await getBusinessSettings(user.uid);
      setSettings(userSettings);
    } else if (isGuestMode) {
      const guestSettings = await getBusinessSettings('demo-guest-user');
      setSettings(guestSettings);
    }
  };

  const enableGuestMode = async () => {
    setIsGuestMode(true);
    setLoading(false);
    const guestSettings = await getBusinessSettings('demo-guest-user');
    setSettings(guestSettings);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        settings,
        refreshSettings,
        isGuestMode,
        enableGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
