import React from 'react'

const Table = () => {
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
            <table className="table">
                <caption>
                    <div className='flex justify-between p-4'>
                        <h3>All Products</h3>
                        <div>
                            <p>Filter</p>
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