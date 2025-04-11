import React from 'react';
import Routes from '../Routes';
import useAuthStore from '../../services/stores/authStore';

const Views = () => {
    const { role } = useAuthStore();

    return (
        <>
            {role === 'CUSTOMER' ? (
                <div className="customer-view">
                    <p>Header</p>
                    <Routes />
                    <p>Footer</p>
                </div>
            ) : role !== null ? (
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
