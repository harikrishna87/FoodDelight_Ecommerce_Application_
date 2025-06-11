import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  const { isAuthenticated, isLoading, user } = auth;

  if (isLoading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          gap: '12px'
        }}
      >
        <Spin size="large" />
        <span style={{ color: '#52c41a', fontSize: '16px' }}>Loading user data...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('You need to login to access this feature', { position: 'top-center' });
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    toast.error('You do not have permission to access this page', { position: 'top-center' });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;