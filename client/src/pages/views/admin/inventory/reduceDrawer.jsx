import React from 'react'
import NoImage from "../../../../assets/No-Image.png"
import { ENDPOINT } from '../../../../services/utilities';

const ReduceDrawer = ({ reduceProduct }) => {
    return (
        <div className='flex flex-col items-center justify-center p-4 gap-4'>
            <div className="h-40 w-40 overflow-hidden rounded border border-gray-300 bg-gray-400 flex items-center justify-center">
                <img
                    className='h-40 w-40 object-fill rounded-md'
                    src={`${ENDPOINT}/assets/products/${reduceProduct.image}`}
                    alt="image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = NoImage
                    }}
                />
            </div>
            <div className="border-y-2 border-gray-100 w-full">
                <h2 className='text-xl font-bold mt-2'>Product Details</h2>

                <div className="flex gap-4 mt-4 w-full items-center justify-start">
                    <p className='text-sm text-gray-500'>Product name:</p>
                    <p className='text-sm text-black'>{reduceProduct.productName}</p>
                </div>

                <div className="flex gap-4 mt-2 w-full items-center justify-start">
                    <p className='text-sm text-gray-500'>Price:</p>
                    <p className='text-sm text-black'>{reduceProduct.sellingPrice}</p>
                </div>

                <div className="flex gap-4 mt-2 w-full items-center justify-start">
                    <p className='text-sm text-gray-500'>Stock:</p>
                    <p className='text-sm text-black'>{reduceProduct.inStock}</p> {/* Later change this to the actual stock */}
                </div>
            </div>
        </div>
    )
}

export default ReduceDrawer