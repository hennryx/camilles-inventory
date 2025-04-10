import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { HiOutlineX } from 'react-icons/hi';

import { toast } from 'react-toastify';

const Login = ({ isOpen, handleClose, handleToggle }) => {
    const [viewPassword, setViewPassword] = useState(false);
    const [errorMsg, seterrorMsg] = useState('')
    const [userData, setUserData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (key, value) => {
        setUserData((prev) => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const { email, password } = userData;
        if(email === "") {
            console.log("email cannot be empty!");
            return
        }

        if(password === "") {
            console.log("password cannot be empty!");
            return
        }

        console.log("loging in...");
        

    }

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(LOGOUT(token))
        .then((response) => {
            toast.success(response.payload)
            dispatch(RESET())
            handleClose()
            window.location.reload()
        })
        .catch((err) => {
            const errorMessage = err?.message || message || "Logout failed";
            toast.error(errorMessage);
        });
    }


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e); // Trigger login on Enter key press
        }
    }

    return (
        <>
            {isOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <div className="flex flex-row justify-between">
                            <h3 className="font-bold text-lg">Login</h3>
                            <button
                                className="btn btn-ghost" 
                                type="button" 
                                onClick={handleClose}
                            >
                                <HiOutlineX />
                            </button>
                        </div>
                        <div className="modal-action">
                            <form id="loginForm" method="POST" className="flex flex-col gap-2 w-full" onKeyDown={handleKeyDown}>
                                <label htmlFor="">Email</label>
                                <div className="input input-bordered flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 16"
                                        fill="currentColor"
                                        className="h-4 w-4 opacity-70">
                                        <path
                                            d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                                        <path
                                            d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                                    </svg>
                                    
                                    <input 
                                        type="email" 
                                        className="grow" 
                                        placeholder="Juan@mail.com" 
                                        name='email'
                                        value={userData.email}
                                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                                    />
                                </div>

                                <label htmlFor="">Password</label>
                                <div className="input input-bordered flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 16"
                                        fill="currentColor"
                                        className="h-4 w-4 opacity-70">
                                        <path
                                            fillRule="evenodd"
                                            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                                            clipRule="evenodd" />
                                    </svg>
                                    <input 
                                        type={viewPassword ? "text" : "password"} 
                                        className="grow" 
                                        placeholder={viewPassword ? "Password" : "******"}
                                        name='password'
                                        value={userData.password}
                                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                                        autoComplete="off"
                                    />
                                    {viewPassword ? (
                                        <button 
                                            type="button"
                                            className='h-full'
                                            onClick={() => setViewPassword(!viewPassword)}
                                        >
                                            <FaRegEye />
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            className='h-full'
                                            onClick={() => setViewPassword(!viewPassword)}
                                        >
                                            <FaRegEyeSlash />
                                        </button>
                                    )}
                                </div>
                                {/* {errorMsg && (
                                    <span className='text-red-600'>{errorMsg}</span>
                                )} */}
                                <label className="signup-link w-full text-center">
                                    Don't have an account? <span> </span>
                                    <button 
                                        className="text-sm font-semibold leading-6 text-blue-700 cursor-pointer" 
                                        onClick={() => {
                                            handleClose()
                                            handleToggle("register", true)
                                        }}
                                    >
                                        Sign up
                                    </button>
                                </label>
                                <div className="flex flex-col gap-2 p-2">
                                    <button 
                                        className="btn w-full justify-center rounded-md bg-blue-300 px-3 py-1.5 text-sm font-semibold leading-6 text-blue-800 shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-650"
                                        onClick={(e) => handleSubmit(e)}
                                    >
                                        Login
                                    </button>
                                    {/* {email && (
                                        <button 
                                            className="btn w-full justify-center rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold leading-6 text-gray-800 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-200"
                                            onClick={(e) => handleLogout(e)}
                                        >
                                            Logout
                                        </button>
                                    )} */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
