import React from 'react';

const Footer = ({ className=""}) => {
    return (
        <footer className="footer">
            <div className={`flex flex-col sm:flex-row w-full p-8 gap-4 sm:gap-8 ${className} ${className.includes('bg-') ? className : 'bg-white'}`}>
                <div className="flex-1 flex flex-col gap-2">
                    <img alt="" src="" className="h-14 w-16" />
                    <p className='text-base'>A good place for good moments. 
                        Prince Nazareth Hotel offers 
                        for Rent! Book/Inquire now! </p>
                    <p className='text-base'>&copy; 2024 Prince Naareth Hotel. All rights reserved. </p>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <h1 className='font-bold text-lg'>Contuct us</h1>
                    <div className='flex flex-row gap-2 items-center'>
                        <i className="text-base fa-solid fa-map-location-dot"></i>
                        <p className='text-base'>Address: Gapan Fort Magsaysay Rd, General Tinio Nueva Ecija </p>
                    </div>
                    <div className='flex flex-row gap-2 items-center'>
                        <i className="text-base fa-solid fa-phone"></i>
                        <p className='text-base'>Phone: +63 951 245 1478</p>
                    </div>
                    <div className='flex flex-row gap-2 items-center'>
                        <i className="text-base fa-solid fa-envelope"></i>
                        <p className='text-base'>Email: <a href="mailto:info@princenaarethhotel.com">info@princenaarethhotel.com</a></p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <h1 className='font-bold text-lg'>Socials</h1>
                    <div className='flex flex-row gap-2 items-center'>
                        <i className="text-base fa-brands fa-facebook"></i>
                        <p className='text-base'>Facebook</p>
                    </div>
                    <div className='flex flex-row gap-2 items-center'>
                        <i className="text-base fa-brands fa-instagram"></i>
                        <p className='text-base'>Instagram</p>
                    </div>
                    <p className='text-base'>Sample</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
