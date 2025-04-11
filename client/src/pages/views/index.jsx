import React from 'react';
import useAuthStore from '../../services/stores/authStore';
import Routes from '../Routes';

const Views = () => {
    const { role } = useAuthStore();
    console.log(role);
    
    return (
        <>
            {role !== null ? (
                <div className="admin-view">
                    <p>Sidebar</p>
                    <p>Header</p>
                    <Routes />
                    <p>Footer</p>
                </div>
            ) : null}
        </>
    );
};

export default Views;
