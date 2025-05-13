// client/src/services/stores/returns/returnsStore.js
import { create } from 'zustand';
import axiosTools from '../../utilities/axiosUtils';

const useReturnsStore = create((set, get) => ({
    data: [],
    returnData: {},
    isSuccess: false,
    message: "",
    isLoading: false,

    getReturns: async (token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.getData('returns/getAll', '', token);

            set({
                data: res.data,
                message: res.message,
                isSuccess: res.success,
                isLoading: false
            });
        } catch (error) {
            set({
                message: error,
                isSuccess: false,
                isLoading: false
            });
        }
    },

    addReturn: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.saveData("returns/save", data, token);

            set({
                returnData: res.returnData,
                isLoading: false, 
                isSuccess: res.success,
                message: res.message
            });
        } catch (error) {
            set({
                isSuccess: false,
                isLoading: false,
                message: error.message
            });
        }
    },

    updateReturn: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.updateData("returns/update", data, token);

            set({
                returnData: res.returnData,
                isLoading: false,
                isSuccess: res.success,
                message: res.message
            });
        } catch (error) {
            set({
                isSuccess: false,
                isLoading: false,
                message: error.message
            });
        }
    },

    deleteReturn: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.deleteData("returns/delete", data, token);

            set({
                returnData: res.returnData,
                isLoading: false,
                isSuccess: res.success,
                message: res.message
            });
        } catch (error) {
            set({
                isSuccess: false,
                isLoading: false,
                message: error.message
            });
        }
    },

    reset: () => {
        set({
            isSuccess: false,
            isLoading: false,
            message: ""
        });
    }
}));

export default useReturnsStore;