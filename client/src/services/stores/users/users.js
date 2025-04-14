import { create } from 'zustand';
import axiosTools from '../../utilities/axiosUtils';

const useUsersStore = create((set, get) => ({
    data: [],
    user: {},
    isLoading: false,
    message: '',
    isSuccess: false,

    getUsers: async (token) => {
        try {
            const res = await axiosTools.getData('users/getAll', "", token);

            console.log(res);
            
            set({
                data: res.data,
                isSuccess: res.success,
            });
        } catch (error) {
            set({
                isSuccess: false,
                message: error?.response?.data?.message || "Something went wrong"
            });
        }
    },

    signup: async (item) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.register('auth/signup', { ...item });

            console.log(res);
            
            set({
                isSuccess: res.success,
                isLoading: false,
                message: 'signup: User created successfully!',
                user: res.user
            });
            
        } catch (error) {
            set({
                isLoading: false,
                message: "eSignup: " + error || 'eSignup: signup failed',
                isSuccess: false,
            });
        }
    },

    reset: () => {
        set({
            message: '',
            isSuccess: false,
            isLoading: false
        });
    },
}));

export default useUsersStore;
