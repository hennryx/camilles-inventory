import { create } from 'zustand';
import axiosTools from '../../utilities/axiosUtils';

const useUsersStore = create((set, get) => ({
    data: [],
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

    reset: () => {
        set({
            message: '',
            isSuccess: false,
            isLoading: false
        });
    },
}));

export default useUsersStore;
