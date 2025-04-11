import React, { useEffect, useState } from 'react';
import { Route, Routes as Switch } from 'react-router-dom';
import NotFound from './notFound';
import ROLES from './views/roles';
import Loading from '../components/loadingPage';
import RouteWrapper from './routeWrapper';
import ProtectedRoute from './protectRoutes';
import useAuthStore from '../services/stores/authStore';

const Routes = () => {
    const { role } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const routes = ROLES[role] || [];

    useEffect(() => {
        setLoading(!role);
    }, [role]);

    if (loading) return <Loading />;

    return (
        <Switch>
            {role && routes.map(({ path, element, children, acceptProps }, index) => {
                if (children) {
                    return children.map((child, cIndex) => (
                        <Route
                            key={`child-${index}-${cIndex}`}
                            path={child.path}
                            element={
                                <ProtectedRoute>
                                    <RouteWrapper Component={child.element} acceptProps={child.acceptProps} />
                                </ProtectedRoute>
                            }
                        />
                    ));
                }

                return (
                    <Route
                        key={`route-${index}`}
                        path={path}
                        element={
                            <ProtectedRoute>
                                <RouteWrapper Component={element} acceptProps={acceptProps} />
                            </ProtectedRoute>
                        }
                    />
                );
            })}

            <Route path="*" element={<NotFound />} />
        </Switch>
    );
};

export default Routes;
