import { create } from "zustand"; 
import axiosTools from "../../utilities/axiosUtils";

const useTransactionsStore = create((set, get) => ({
    data: [],
    isSuccess: false,
    message: "",
    isLoading: false,

    getTransactions: async(token) => {
        set({
            isSuccess: false,
            isLoading: true,
            message: ""
        })
        try {
            const res = await axiosTools.getData("transactions/getAll", '', token);

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

    reset: () => {
        set({
            isSuccess: false,
            isLoading: false,
            message: ""
        })
    }

}))

export default useTransactionsStore;