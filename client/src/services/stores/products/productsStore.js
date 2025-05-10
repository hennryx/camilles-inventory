// client/src/services/stores/products/productsStore.js
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

    getProducts: async (token, data = "") => {
        set({ isLoading: true, isSuccess: false, message: "" });

        try {
            const res = await axiosTools.getData('products/getAll', data, token);

            set({
                data: res.data,
                productInfo: {
                    totalItems: res.totalItems,
                    minimumStock: res.minimumStock,
                    outStock: res.outStock,
                },
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
    
    addProduct: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });
        try {
            const res = await axiosTools.saveData("products/save", data, token);

            // Immediately update the store with the new product
            const currentData = get().data;
            set({
                data: [res.product, ...currentData],
                product: res.product,
                message: res.message,
                isSuccess: res.success,
                isLoading: false,
                productInfo: {
                    ...get().productInfo,
                    totalItems: get().productInfo.totalItems + 1
                }
            });

        } catch (error) {
            set({
                message: error,
                isSuccess: false,
                isLoading: false
            });
        }
    },

    deleteProduct: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

        try {
            const res = await axiosTools.deleteData("products/delete", data, token);

            // Immediately update the store by removing the product
            const currentData = get().data.filter(item => item._id !== data._id);
            
            set({
                data: currentData,
                product: res.product,
                message: res.message,
                isSuccess: res.success,
                isLoading: false,
                productInfo: {
                    ...get().productInfo,
                    totalItems: get().productInfo.totalItems - 1,
                    // Update outStock if the deleted product was out of stock
                    outStock: res.product.inStock === 0 
                        ? get().productInfo.outStock - 1 
                        : get().productInfo.outStock
                }
            });
        } catch (error) {
            set({
                message: error,
                isSuccess: false,
                isLoading: false
            });
        }
    },

    updateProduct: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

        try {
            const res = await axiosTools.updateData("products/update", data, token);

            // Immediately update the store by replacing the updated product
            const currentData = get().data;
            const updatedData = currentData.map(item => 
                item._id === res.product._id ? res.product : item
            );
            
            set({
                data: updatedData,
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
            });
        }
    },

    deducProduct: async (data, token) => {
        set({ isLoading: true, message: '', isSuccess: false });

        try {
            const res = await axiosTools.saveData("products/deduct", data, token);

            // Immediately update the store with the updated products
            if (res.data) {
                set({
                    data: res.data,
                    message: res.message,
                    isSuccess: res.success,
                    isLoading: false
                });
            } else {
                // Refresh product data if the response doesn't include updated products
                get().getProducts(token);
            }
        } catch (error) {
            set({
                message: error,
                isSuccess: false,
                isLoading: false
            });
        }
    },

    reset: () => {
        set({
            message: '',
            isSuccess: false,
            isLoading: false
        });
    }
}));

export default useProductsStore;