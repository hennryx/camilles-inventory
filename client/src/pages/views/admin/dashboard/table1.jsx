import React, { useEffect, useState } from 'react'
import useTransactionsStore from '../../../../services/stores/transactions/transactionStore'
import useAuthStore from '../../../../services/stores/authStore'

const Table = () => {
    const { token } = useAuthStore();
    const { getTransactions, data } = useTransactionsStore();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if(token) {
            getTransactions(token)
        }
    }, [token]);

    useEffect(() => {
        if(data) {
            setTransactions(data);
            console.log(data);
        }
    }, [data])

    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
            <table className="table">
                <caption>
                    <div className='flex justify-between p-4'>
                        <h3>Transactions</h3>
                        <div>
                            <p>Filter</p>
                        </div>
                    </div>
                </caption>
                <thead>
                    <tr className='text-black bg-gray-300'>
                        <th>#</th>
                        <th>Transaction</th>
                        <th>Products</th>
                        <th>Supplier</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 && transactions.map((item, i) =>
                        <tr key={i}>
                            <th>{i+1}</th>
                            <td>{item.transactionType}</td>
                            <td className='flex flex-col gap-2'>{item.products?.map((prd, x) => (
                                <p key={x}>
                                    <span>{prd.product?.productName}</span> <br />
                                    <span>{prd.product?.unitSize} {prd.product?.unit}</span>
                                </p>
                            ))}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Table