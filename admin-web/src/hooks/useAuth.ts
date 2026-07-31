import { useState, useEffect } from 'react';
import { AuthRepository } from '../repositories/AuthRepository';
import { AdminUser } from '../models/types';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = AuthRepository.subscribeAuthChanges(async (fbUser) => {
      if (fbUser) {
        try {
          const mapped = await AuthRepository.mapUser(fbUser);
          setUser(mapped);
        } catch (e) {
          console.error('Error mapping auth user:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await AuthRepository.logout();
    setUser(null);
  };

  return { user, loading, logout };
}
