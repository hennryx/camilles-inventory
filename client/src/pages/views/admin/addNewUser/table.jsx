import React from 'react'
import { IoIosAdd } from "react-icons/io";

const Table = ({ data, toggleAdd }) => {
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
            <table className="table">
                <caption>
                    <div className='flex justify-between p-4'>
                        <h3 className='text-xl'>Users</h3>
                        <div className='flex flex-row gap-4 justify-center items-center'>
                            <label className="input bg-transparent border-2 border-gray-500 rounded-md">
                                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                                <input type="search" required placeholder="Search" />
                            </label>
                            <button
                                className='flex items-center justify-center px-4 py-3 bg-green-200 rounded-md text-green-800 whitespace-nowrap hover:bg-green-300'
                                onClick={() => toggleAdd((prev) => !prev)}
                            >
                                <IoIosAdd />
                                Add New User
                            </button>
                        </div>
                    </div>
                </caption>
                <thead>
                    <tr className='text-black bg-gray-300'>
                        <th>#</th>
                        <th>Name</th>
                        <th>Mail</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody className='text-gray-500'>
                    {data.map((data, i) => (
                        <tr key={i}>
                            <th>{i+1}</th>
                            <td>{data.firstname} {data.middlename} {data.lastname}</td>
                            <td>{data.email}</td>
                            <td>{data.role}</td>
                            <td className='flex flex-row justify-center items-center gap-2 p-2'>
                                <button className='p-2 bg-blue-200 text-blue-800 rounded-md hover:bg-blue-300'>Update</button>
                                <button className='p-2 bg-red-200 text-red-800 rounded-md hover:bg-red-300'>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table