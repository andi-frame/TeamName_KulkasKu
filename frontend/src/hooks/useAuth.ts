/* eslint-disable */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { toast } from 'sonner';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error: any) {      
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/auth/login', data);
      toast.success('Login successful!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { register, login, loading };
};