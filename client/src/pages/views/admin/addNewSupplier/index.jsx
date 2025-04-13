import React from 'react'
import Table from './table'

const AddNewSupplier = () => {
    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div className=''>
                    <h2 className='text-xl text-[#4154F1]'>Add new supplier</h2>
                    <p className='text-sm text-[#989797]'>supplier / </p>
                </div>

                <div>
                    <Table />
                </div>

            </div>
        </div>
    )
}

export default AddNewSupplier