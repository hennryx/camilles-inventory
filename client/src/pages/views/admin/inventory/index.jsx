import React from 'react'
import Table from './table'
import { BsBoxSeam } from "react-icons/bs";
import { FaBoxOpen } from "react-icons/fa6";
import { BsBoxSeamFill } from "react-icons/bs";
import Card from './card';

const Inventory = () => {
    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div className=''>
                    <h2 className='text-xl text-[#4154F1]'>Inventory</h2>
                    <p className='text-sm text-[#989797]'>Inventory / </p>
                </div>
                <div>
                    <div className="bg-white p-2 shadow-md rounded-md">
                        <div className="flex flex-row gap-4 justify-start items-center px-2">
                            <Card title={"Total products"} textClr={'text-[#525B5F]'} boxClr={'bg-gray-400'} logo={BsBoxSeam} count={48} />
                            <div className='border-2 border-blue-200 h-10'></div>
                            <Card title={"Stock out:"} textClr={'text-red-800'} boxClr={'bg-red-200'} logo={FaBoxOpen} count={25} />
                            <div className='border-2 border-blue-200 h-10'></div>
                            <Card title={"Stock low:"} textClr={'text-yellow-800'} boxClr={'bg-yellow-200'} logo={BsBoxSeamFill} count={22} />
                        </div>
                    </div>
                </div>
                <div>
                    <Table />
                </div>
            </div>
        </div>
    )
}

export default Inventory