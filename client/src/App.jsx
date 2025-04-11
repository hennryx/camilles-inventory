import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';

import './App.css'
import useAuthStore from './services/stores/authStore';
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

    return (
        <>
            <Routes>
                {/* HeroPage will handle its own internal routing */}
                <Route path="/*" element={<HeroPage />} />
                
                {/* Protected dashboard routes */}
                <Route path="/dashboard/*" element={<Views />} />
            </Routes>
        </>
    )
}

export default App