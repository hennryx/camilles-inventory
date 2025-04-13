import React from 'react'
import Table from './table'

const AddNewUser = () => {
    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div className=''>
                    <h2 className='text-xl text-[#4154F1]'>Add new user</h2>
                    <p className='text-sm text-[#989797]'>Users / </p>
                </div>
                <div>
                <Table />
                </div>
            </div>
        </div>
    )
}

export default AddNewUser