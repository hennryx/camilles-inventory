import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';

import './App.css'
import useAuthStore from './services/stores/authStore';
import NotFound from './pages/notFound';
import HeroPage from './pages/home';
import Views from './pages/views';
import ResetPassword from './pages/resetPassword';
import ForgotPassword from './pages/forgotPassword';

function App() {
    const { auth, token, validateToken } = useAuthStore();

    useEffect(() => {
        if (!auth?._id && token) {
            validateToken();
        }
    }, [auth?._id, token]);

    const heroPaths = [
        '/',
        '/about-us',
        '/forgot-password',
        '/reset-password' 
    ];
    
    const isHeroPath = heroPaths.some(path => 
        location.pathname === path || 
        (path === '/reset-password' && location.pathname.startsWith('/reset-password/'))
    );

    const urlPath = location.pathname;

    return (
        <>
            <Routes>
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<HeroPage />} />
                <Route path="/about-us" element={<HeroPage />} />
                <Route path="*" element={isHeroPath ? <HeroPage /> : <Views />} />
            </Routes>
        </>
    )
}

export default App
