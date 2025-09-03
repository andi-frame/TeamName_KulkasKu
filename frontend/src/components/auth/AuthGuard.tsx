import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { LoadingOverlay } from '@/components/loading-overlay';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.status !== 200) {
          throw new Error('Not authenticated');
        }
        if (res.data.has_onboarded === false) {
          router.push('/onboarding');
        } else {
          setLoading(false);
        }
      } catch (error) {
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <LoadingOverlay />;
  }

  return <>{children}</>;
};
