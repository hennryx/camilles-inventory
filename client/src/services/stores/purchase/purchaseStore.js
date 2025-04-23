import { create } from "zustand"; 
import axiosTools from "../../utilities/axiosUtils";

const usePurchaseStore = create((set, get) => ({
    data: [],
    purchase: {},
    isSuccess: false,
    message: "",
    isLoading: false,

    getPurchases: async(token) => {
        set({
            isSuccess: false,
            isLoading: true,
            message: ""
        })
        try {
            const res = await axiosTools.getData("purchases/getAll", '', token);

            set({
                data: res.data,
                message: res.message,
                isSuccess: res.success,
                isLoading: false
            })
        } catch (error) {
            set({
                isSuccess: false,
                isLoading: false,
                message: error.message
            })
        }
    }, 

    addPurchase: async (token, data) => {
        set({ isSuccess: false, isLoading: true, message: ""})
        try {
            const res = await axiosTools.saveData("purchases/save", data, token);

            set({
                purchase: res.purchase,
                isLoading: false,
                isSuccess: res.success,
                message: res.message
            })

        } catch (error) {
            set({
                isSuccess: false,
                isLoading: false,
                message: error.message
            })
        }
    }, 

    updatePurchase: async (token, data) => {
        set({ isSuccess: false, isLoading: true, message: ""})
        try {
            const res = await axiosTools.updateData("purchases/update", data, token);

            set({
                purchase: res.purchase,
                isLoading: false,
                isSuccess: res.success,
                message: res.message
            })

        } catch (error) {
            set({
                isSuccess: false,
                isLoading: false,
                message: error.message
            })
        }
    }, 

    deletePurchase: async (token, data) => {
        set({ isSuccess: false, isLoading: true, message: ""})
        try {
            const res = await axiosTools.deleteData("purchases/delete", data, token);

            set({
                purchase: res.purchase,
                isLoading: false,
                isSuccess: res.success,
                message: res.message
            })

        } catch (error) {
            set({
                isSuccess: false,
                isLoading: false,
                message: error.message
            })
        }
    },

    reset: () => {
        set({
            isSuccess: false,
            isLoading: false,
            message: ""
        })
    }

}))

export default usePurchaseStore;