import axiosTools from "../../utilities/axiosUtils";
import { create } from "zustand";

const useProductsStore = create((set, get) => ({
    data: [],
    product: {},
    isSuccess: false,
    message: "",
    isLoading: false,

    getProducts: async (token, data="") => {
        set({ isLoading: true, isSuccess: false, message: ""})

        try {
            const res = await axiosTools.getData('products/getAll', data, token);

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
    addProduct: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.saveData("products/save", data, token)

            set({
                product: res.product,
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

    deleteproduct: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

        try {
            const res = await axiosTools.deleteData("products/delete", data, token)

            set({
                product: res.product,
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

    updateProduct: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

        try {
            const res = await axiosTools.updateData("products/update", data, token)

            set({
                product: res.product,
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

export default useProductsStore;