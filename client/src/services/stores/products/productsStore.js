import axiosTools from "../../utilities/axiosUtils";
import { create } from "zustand";

const useProductsStore = create((set, get) => ({
    data: [],
    product: {},
    isSuccess: false,
    message: "",
    isLoading: false,
    productInfo: {
        minStock: 0,
        outStock: 0,
        totalItems: 0
    },

    getProducts: async (token, data="") => {
        set({ isLoading: true, isSuccess: false, message: ""})

        try {
            const res = await axiosTools.getData('products/getAll', data, token);

            set({
                data: res.data,
                productInfo: {
                    totalItems: res.totalItems,
                    minStock: res.minimumStock,
                    outStock: res.outStock,
                },
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

    deleteProduct: async (data, token) => {
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