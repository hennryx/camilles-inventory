import { create } from 'zustand';
import axiosTools from '../../utilities/axiosUtils';

const useSuppliersStore = create((set, get) => ({
    data: [],
    supplier: {},
    isSuccess: false,
    message: "",
    isLoading: false,

    getSuppliers: async (token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.getData('suppliers/getAll', '', token);

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
            const res = await axiosTools.saveData("suppliers/save", data, token)

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

        try {
            const res = await axiosTools.deleteData("suppliers/delete", data, token)

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

    updateSupplier: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

        try {
            const res = await axiosTools.updateData("suppliers/update", data, token)

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

    reset: () => {
        set({
            message: '',
            isSuccess: false,
            isLoading: false
        });
    }
}))

export default useSuppliersStore;