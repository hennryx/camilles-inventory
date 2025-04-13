import React from 'react'

const Card = ({title, textClr, boxClr, logo: Logo, count }) => {
  return (
    <div className='flex flex-row gap-3 justify-center items-center'>
      <Logo size={20} className="text-[#525B5F]" />
      <h2 className="text-[#525B5F]">{title} </h2>
      <span className={`${boxClr} rounded-sm p-1`}>
        <p className={`${textClr} text-sm`}>{count}</p>
      </span>
    </div>
  )
}

export default Card