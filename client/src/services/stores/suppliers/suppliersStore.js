import { create } from 'zustand';
import axiosTools from '../../utilities/axiosUtils';
import saveData from '../../utilities/axiosUtils/post';
import getData from '../../utilities/axiosUtils/get';

const useSuppliersStore = create((set, get) => ({
    data: [],
    supplier: {},
    isSuccess: false,
    message: "",
    isLoading: false,

    getSuppliers: async (token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await getData('suppliers/getAll', '', token);

            set({
                data: res.data,
                message: res.message,
                isSuccess: res.success,
                isLoading: false
            })
        } catch (error) {
            set({
                message: error,
                isSuccess: false,
                isLoading: false
            })
        }
    },

    addSupplier: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await saveData(url, data, token)

            set({
                supplier: res.user,
                message: res.message,
                isSuccess: res.success,
                isLoading: false
            });

        } catch (error) {
            set({
                message: error,
                isSuccess: false,
                isLoading: false
            })
        }

    },

    deleteSupplier: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

    },

    updateSupplier: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

    },

    reset: () => {
        set({
            message: '',
            isSuccess: false,
            isLoading: false
        });
    }
}))

export default useSuppliersStore;