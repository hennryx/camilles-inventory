import React, { useState } from 'react';
import { Route, Routes, useLocation } from "react-router-dom";

import Login from './login';
import Home from "./pages/home";
import AboutUs from "./pages/about-us"; // You'll need to create this component
import Header from './header';
import Footer from '../../components/footer';
import NotFound from '../notFound';

const HeroPage = () => {
    const [toggle, setToggle] = useState({
        login: false,
        register: false,
        home: true,
    });
    
    const location = useLocation();
    
    const handleToggle = (name, val = false) => {
        setToggle({
            login: false,
            register: false,
            home: val ? val : true,
            [name]: val,
        });
    };

    return (
        <main className="min-h-screen flex flex-col">
            <div className="bg-white flex-1">
                <Header handleToggle={handleToggle} />
                <div className='my-16 w-full h-full'>
                    <Routes>
                        <Route index element={<Home handleToggle={handleToggle} />} />
                        <Route path="about-us" element={<AboutUs />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>

                <Login isOpen={toggle.login} handleClose={() => handleToggle('login', false)} handleToggle={handleToggle} />
            </div>
            <Footer className='bg-gray-200 shadow-md border-t-2' />
        </main>
    );
};

export default HeroPage;