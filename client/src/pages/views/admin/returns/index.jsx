import React from 'react'
import Table from './table'

const Returns = () => {
  return (
    <div className='container'>
        <div className="flex flex-col gap-5 pt-4">
            <div className=''>
                <h2 className='text-xl text-[#4154F1]'>Returns</h2>
                <p className='text-sm text-[#989797]'>Returns / </p>
            </div>

            <div>
                <Table />
            </div>

        </div>
    </div>
  )
}

export default Returns