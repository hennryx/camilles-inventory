import React from 'react';
import { useLocation } from 'react-router-dom';

const RouteWrapper = ({ Component, acceptProps = [] }) => {
  const location = useLocation();
  const routeState = location.state || {};
  
  // Filter only accepted props
  const validProps = acceptProps.reduce((acc, key) => {
    if (routeState[key] !== undefined) {
      acc[key] = routeState[key];
    }
    return acc;
  }, {});

  return <Component {...validProps} />;
};

export default RouteWrapper;