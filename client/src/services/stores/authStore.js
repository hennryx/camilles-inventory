import { create } from 'zustand';
import axiosTools from '../utilities/axiosUtils';

const tokenFromStorage = localStorage.getItem('token');

const useAuthStore = create((set, get) => ({
  auth: {},
  token: tokenFromStorage || '',
  role: null,
  email: '',
  isLoading: false,
  message: '',
  isSuccess: false,

  login: async ({ email, password }) => {
    set({ isLoading: true, message: '', isSuccess: false });
    try {
      const res = await axiosTools.login('auth/login', { email, password });
      const { data } = res;

      localStorage.setItem('token', data.token);

      set({
        auth: data,
        token: data.token,
        role: data.role,
        email: data.email,
        isSuccess: true,
        isLoading: false,
        message: 'Login successful',
      });
    } catch (error) {
      set({
        isLoading: false,
        message: error?.response?.data?.message || 'Login failed',
        isSuccess: false,
      });
    }
  },

  validateToken: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await axiosTools.validateToken('auth/validateToken', token);
      const { data } = res;

      set({
        auth: data,
        role: data.role,
        email: data.email,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, message: 'Token validation failed' });
    }
  },

  logout: async () => {
    const token = get().token;
    try {
      await axiosTools.logOut('auth/logout', token);
      localStorage.removeItem('token');
      set({
        auth: {},
        token: '',
        role: null,
        email: '',
        isSuccess: false,
        message: '',
      });
    } catch (error) {
      set({ message: 'Logout failed' });
    }
  },

  reset: () => {
    set({
      auth: {},
      token: '',
      role: null,
      email: '',
      message: '',
      isSuccess: false,
    });
  }
}));

export default useAuthStore;
