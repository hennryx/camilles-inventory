import React from 'react'
import { IoIosAdd } from 'react-icons/io'

const Table = () => {
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
            <table className="table">
                <caption>
                    <div className='flex justify-between p-4'>
                        <h3 className='text-xl'>Purchase</h3>
                        <div className='flex flex-row gap-4 justify-center items-center'>
                            <label className="input bg-transparent border-2 border-gray-500 rounded-md">
                                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                                <input type="search" required placeholder="Search" />
                            </label>
                            <div>Filter</div>
                            <button className='flex items-center justify-center px-4 py-3 bg-blue-200 rounded-md text-blue-800 whitespace-nowrap' >
                                <IoIosAdd />
                                Add new Purchase
                            </button>
                        </div>
                    </div>
                </caption>
                <thead>
                    <tr className='text-black bg-gray-300'>
                        <th>#</th>
                        <th>Name</th>
                        <th>Job</th>
                        <th>Favorite Color</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>1</th>
                        <td>Cy Ganderton</td>
                        <td>Quality Control Specialist</td>
                        <td>Blue</td>
                    </tr>
                    <tr>
                        <th>2</th>
                        <td>Hart Hagerty</td>
                        <td>Desktop Support Technician</td>
                        <td>Purple</td>
                    </tr>
                    <tr>
                        <th>3</th>
                        <td>Brice Swyre</td>
                        <td>Tax Accountant</td>
                        <td>Red</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Table