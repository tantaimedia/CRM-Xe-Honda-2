import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CustomerProvider, notificationService } from './hooks/useCustomers';
import { ThemeProvider } from './hooks/useTheme';
import { AuthForm } from './components/auth/AuthForm';
import { MfaSetup } from './components/auth/MfaSetup';
import { MfaVerifier } from './components/auth/MfaVerifier';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar, HondaLogo } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { Customer } from './types';
import { Spinner } from './components/common/Spinner';
import { UserManagement } from './components/UserManagement';

type View = 'dashboard' | 'customers' | 'usermanagement';

const VIEW_TITLES: Record<View, string> = {
    dashboard: 'Bảng Điều Khiển',
    customers: 'Quản Lý Khách Hàng',
    usermanagement: 'Quản Lý Người Dùng',
};

const Footer: React.FC = () => {
    return (
        <footer className="flex items-center justify-center h-16 px-4 md:px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <HondaLogo className="h-6 w-auto text-honda-red" />
            <p className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} GIA HÒA 6 CRM. All rights reserved.
            </p>
        </footer>
    );
};

const MainApp: React.FC = () => {
    const { user, loading, mfaStatus } = useAuth();
    const [mfaSkipped, setMfaSkipped] = useState(false);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    // Request notification permission when the app is loaded and user is logged in.
    useEffect(() => {
        if (notificationService.isSupported() && Notification.permission === 'default') {
            notificationService.requestPermission();
        }
    }, []);

    if (loading) {
        return <div className="flex h-screen justify-center items-center"><Spinner size="h-12 w-12" /></div>;
    }

    if (!user) {
        return <AuthForm />;
    }

    if (mfaStatus === 'not_enrolled' && !mfaSkipped) {
        return <MfaSetup onComplete={() => setMfaSkipped(true)} />;
    }
    
    if (mfaStatus === 'unverified') {
        return <MfaVerifier />;
    }

    const handleNavigate = (view: View) => {
        setCurrentView(view);
        setSelectedCustomer(null);
        setIsSidebarOpen(false); // Close sidebar on navigation
    };

    return (
        <ProtectedRoute>
            <CustomerProvider>
                <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <Sidebar 
                        currentView={currentView} 
                        onNavigate={handleNavigate} 
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                    />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header title={VIEW_TITLES[currentView]} onMenuClick={() => setIsSidebarOpen(true)} />
                        <main className="flex-1 overflow-y-auto p-4 md:p-6">
                            <div className="h-full flex gap-6">
                                <div className={`w-full transition-all duration-300 ${selectedCustomer && currentView === 'customers' ? 'hidden md:block md:w-2/3 xl:w-3/4' : 'w-full'}`}>
                                    {currentView === 'dashboard' && <Dashboard />}
                                    {currentView === 'customers' && <CustomerList onSelectCustomer={setSelectedCustomer} />}
                                    {currentView === 'usermanagement' && <UserManagement />}
                                </div>
                                {selectedCustomer && currentView === 'customers' && (
                                    <CustomerDetail customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
                                )}
                            </div>
                        </main>
                        <Footer />
                    </div>
                </div>
            </CustomerProvider>
        </ProtectedRoute>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <MainApp />
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
