import React, { useState } from 'react';
import { Route, Routes as Switch } from "react-router-dom";

import Login from './login';

import Home from "./pages/home"
import Header from './header';
import Footer from '../../components/footer';

const HeroPage = () => {
    const [toggle, setToggle] = useState({
        login: false,
        register: false,
        home: true,
    });

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
                    <Switch>
                        <Route
                            path="/"
                            element={<Home handleToggle={handleToggle} />}
                        />
                        {/* <Route path='/foods' Component={StaticMenu}></Route> */}

                    </Switch>
                </div>

                <Login isOpen={toggle.login} handleClose={() => handleToggle('login', false)} handleToggle={handleToggle} />
            </div>
            <Footer className='bg-gray-200 shadow-md border-t-2' />
        </main>
    );
};

export default HeroPage;
