import React from 'react'

const Card = ({ title, count, logo: Logo, logoColor = "black"}) => {
    return (
        <div className="flex-1 bg-white shadow-md rounded-2xl">
            <div className='p-4'>
                <h2 className="card-title text-md text-[#4154F1]">{title}</h2>
                <p className='font-bold text-sm'>{count}</p>
                <div className="card-actions justify-end">
                    <Logo size={30} className={`${logoColor}`} />
                </div>
            </div>
        </div>
    )
}

export default Card