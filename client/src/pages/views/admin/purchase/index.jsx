import React from 'react'
import Table from './table'

const Purchase = () => {
  return (
    <div className='container'>
        <div className="flex flex-col gap-5 pt-4">
            <div className=''>
                <h2 className='text-xl text-[#4154F1]'>Purchase</h2>
                <p className='text-sm text-[#989797]'>purchase / </p>
            </div>

            <div>
                <Table />
            </div>

        </div>
    </div>
  )
}

export default Purchase