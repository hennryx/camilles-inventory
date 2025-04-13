import React from 'react'

const Card = ({ title, count, logo: Logo, logoColor = "black"}) => {
    return (
        <div className="card flex-1 bg-white shadow-md rounded-2xl p-0">
            <div className="card-body p-2">
                <h2 className="card-title text-xl text-[#4154F1]">{title}</h2>
                <p className='font-bold'>{count}</p>
                <div className="card-actions justify-end">
                    <Logo size={35} className={`${logoColor}`} />
                </div>
            </div>
        </div>
    )
}

export default Card