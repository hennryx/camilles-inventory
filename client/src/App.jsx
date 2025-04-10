import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';

import './App.css'
import useAuthStore from './services/stores/authStore';
import NotFound from './pages/notFound';
import HeroPage from './pages/home';
import Views from './pages/views';

function App() {
    const { auth, token, validateToken } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        if (!auth?._id && token) {
            validateToken();
        }
    }, [auth?._id, token]);

    const heroPaths = [
        '/',
    ];
    
    const isHeroPath = heroPaths.includes(location.pathname);


    return (
        <>
            <Routes>
                <Route path="*" element={<NotFound />} />
                <Route path="/" element={isHeroPath ? <HeroPage /> : <Views />} />
            </Routes>
        </>
    )
}

export default App
