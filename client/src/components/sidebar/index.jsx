import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import ROLES from '../../pages/views/roles';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { toast } from 'react-toastify';
import useAuthStore from '../../services/stores/authStore';
import { BsList } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import { IoMdLogOut } from "react-icons/io";

import './sidebar.css'


const Sidebar = ({ role, token }) => {
    const menuItems = ROLES[role] || [];
    const { logout, isSuccess, message, reset, hardReset, auth } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAccOpen, setIsAccOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    console.log(auth);
    


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1199) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const path = location.pathname;
        const index = menuItems.findIndex(item => item.path === path);

        toggleMenu(index)

    }, [location.pathname])

    const toggleMenu = (index) => {
        setExpandedMenu((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
        setActiveIndex(index);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        console.log("Loging out...");
        await logout();
    }

    useEffect(() => {
        if (isSuccess) {
            console.log("true");

            navigate("/");
            window.location.reload();

            setTimeout(() => {
                hardReset()
            }, 100)
        } else if (message) {
            toast.error(message || "Something went wrong.");
            reset()
        }

    }, [isSuccess, message])

    return (
        <div className={`flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} h-auto sidebar-main transition-[width] duration-500 relative gap-6 bg-blue-700`}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-2 m-4 text-black focus:outline-none transition flex ${isCollapsed ? 'justify-center content-center' : 'justify-between'} items-center font-bold z-[1]`}
            >
                {!isCollapsed && (
                    <span className='font-bold transition-opacity duration-300 opacity-100 text-white'>
                        Camille's Store
                    </span>
                )}

                <BsList size={25} className="transition-transform duration-300 text-white" />
            </button>

            <nav className="sidebar z-[1] flex-1">
                <ul className="mt-6 space-y-2">
                    {menuItems.map((item, index) => (
                        <li key={index} className='flex flex-col items-end transition-all duration-300'>
                            <div
                                onClick={() => toggleMenu(index)}
                                className={`w-[90%] flex items-center transition-colors duration-200 ${activeIndex === index ? "active" : ""}`}
                            >
                                <b></b>
                                <b></b>
                                {!item.children ? (
                                    <NavLink
                                        to={item.path}
                                        className={`${isCollapsed && "py-4"} flex items-center space-x-2 h-full w-full px-4 py-2 transition-all duration-300`}
                                    >
                                        <item.icon />
                                        {!isCollapsed && (
                                            <span
                                                className="p-2 transition-opacity duration-300 opacity-100"
                                                style={{ textWrap: "nowrap" }}
                                            >
                                                {item.name}
                                            </span>
                                        )}
                                    </NavLink>
                                ) : (
                                    <div
                                        className="flex items-center space-x-2 text-black cursor-pointer"
                                    >
                                        <i className={`${item.icon} mr-2`}></i>
                                        {!isCollapsed && (
                                            <span
                                                className="text-black transition-opacity duration-300"
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                {item.name}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {item.children && !isCollapsed && (
                                    <button
                                        style={{ marginRight: '1rem' }}
                                        className="focus:outline-none transition-transform duration-300"
                                    >
                                        {expandedMenu[index] ? (
                                            <HiChevronUp className="text-black transform rotate-180" />
                                        ) : (
                                            <HiChevronDown className="text-black" />
                                        )}
                                    </button>
                                )}
                            </div>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedMenu[index] && !isCollapsed ? 'max-h-60' : 'max-h-0'
                                    }`}
                            >
                                {item.children && (
                                    <ul className="pl-6 space-y-1">
                                        {item.children.map((child, cIndex) => (
                                            <li key={cIndex}>
                                                <NavLink
                                                    to={`${item.path}${child.path}`}
                                                    className="flex items-center space-x-2 text-black hover:border-l-4 border-red-600 p-2 rounded transition-all duration-300"
                                                >
                                                    <span className="text-black">{child.name}</span>
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>

            <div
                className={`text-black flex flex-col items-center flex-nowrap duration-300 ease-in-out bg-blue-900 ${isAccOpen && "h-40"}`}
            >
                <div 
                    className={`bg-blue-800 h-full w-full flex items-center transition-[height] duration-500 ease-in-out ${isCollapsed ? 'justify-center p-4' : "justify-start py-4 pl-10 pr-4"} gap-4`}
                    onClick={(e)=> setIsAccOpen(prev => !prev)}
                >
                    <VscAccount className='text-white' size={22} />
                    {!isCollapsed && <span className='text-white transition-opacity duration-500'>{auth.name}</span>}
                </div>
                {isAccOpen && (
                    <>
                        <div className="py-2 pl-10 pr-4 cursor-pointer  hover:bg-blue-600 w-full flex gap-4 items-center">
                            <VscAccount className='text-white' size={20} />
                            {!isCollapsed && (
                                <span className="ml-2 transition-opacity duration-300 text-white">Account</span>
                            )}
                        </div>

                        <div className="py-2 pl-10 pr-4 cursor-pointer  hover:bg-blue-600 w-full flex gap-4 items-center" onClick={(e) => handleLogout(e)}>
                        <IoMdLogOut size={20} className='text-white'/>
                            {!isCollapsed && (
                                <span className="ml-2 transition-opacity duration-300 text-white">Logout</span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
