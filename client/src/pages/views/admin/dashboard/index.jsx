import React from 'react'
import Card from './card'
import { BsBoxes } from "react-icons/bs";
import { FaCheckDouble } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
import Table from './table';

const Dashboard = () => {
    return (
        <div className='container'>
            <div className="flex flex-col gap-5 pt-4">
                <div>
                    <h2 className='text-2xl'>Hi, here's what's happening in your store</h2>
                </div>

                <div className='flex gap-5'>
                    <Card title={"Total Products"} count={122} logo={BsBoxes}/>
                    <Card title={"Recently Added Products"} count={100} logo={FaCheckDouble} logoColor='text-green-400' />
                    <Card title={"Out of Stock of Products"} count={12} logo={FaBoxOpen} logoColor='text-yellow-400' />
                </div>
                
                <div>
                    <Table />
                </div>
            </div>
        </div>
    )
}

export default Dashboard