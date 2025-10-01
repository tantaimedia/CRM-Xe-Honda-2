import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService, AuthState } from '../services/authService';

type AuthContextType = AuthState;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>(authService.getInitialState());

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange(setAuthState);
        authService.checkSession();
        return () => unsubscribe();
    }, []);

    // FIX: Replaced JSX with React.createElement because this is a .ts file, not .tsx.
    return React.createElement(AuthContext.Provider, { value: authState }, children);
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
