import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../common/Spinner';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen justify-center items-center"><Spinner size="h-12 w-12" /></div>;
    }

    if (!user) {
        // In a real app with a router, you would redirect to the login page.
        // For example: return <Navigate to="/login" />;
        // Since we don't have a router, the App component handles this logic.
        console.error("ProtectedRoute: No user found. App component should prevent this render.");
        return null; 
    }

    return <>{children}</>;
};
