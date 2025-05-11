import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../../services/stores/authStore';
import useProductsStore from '../../../../services/stores/products/productsStore';
import useReturnsStore from '../../../../services/stores/returns/returnsStore';
import Table from './table';
import ReturnModal from './returnModal';
import Swal from 'sweetalert2';

const Returns = () => {
    const { token } = useAuthStore();
    const { getProducts } = useProductsStore();
    const { getReturns, data, isSuccess, isLoading, message, reset } = useReturnsStore();
    
    const [toggleAdd, setToggleAdd] = useState(false);
    const [returnsData, setReturnsData] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState({
        products: [],
        notes: '',
        transactionType: 'RETURN'
    });

    useEffect(() => {
        if (token) {
            getReturns(token);
            getProducts(token);
        }
    }, [token]);

    useEffect(() => {
        if (data) {
            setReturnsData(data);
        }
    }, [data]);

    const handleUpdate = (returnData) => {
        setToggleAdd(true);
        setSelectedReturn(returnData);
        setIsUpdate(true);
    };

    useEffect(() => {
        if (isSuccess && message) {
            setToggleAdd(false);
            setSelectedReturn({
                products: [],
                notes: '',
                transactionType: 'RETURN'
            });
            
            Swal.fire({
                title: "Success!",
                text: message,
                icon: "success"
            });
            
            reset();
        } else if (message) {
            Swal.fire({
                title: "Error!",
                text: message,
                icon: "error"
            });
            
            reset();
        }
    }, [isSuccess, message]);

    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div className=''>
                    <h2 className='text-xl text-[#4154F1]'>Returns</h2>
                    <p className='text-sm text-[#989797]'>Returns / {toggleAdd ? 'Add New Return' : ''}</p>
                </div>

                {toggleAdd ? (
                    <ReturnModal
                        setIsOpen={setToggleAdd}
                        returnData={selectedReturn}
                        setReturnData={setSelectedReturn}
                        isUpdate={isUpdate}
                        setIsUpdate={setIsUpdate}
                    />
                ) : (
                    <Table 
                        data={returnsData}
                        toggleAdd={setToggleAdd}
                        handleUpdate={handleUpdate}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default Returns;