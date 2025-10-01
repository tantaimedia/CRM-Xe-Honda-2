

import React from 'react';
import { useAuth } from '../hooks/useAuth';

// A reusable and scalable SVG component for the Honda wing logo.
export const HondaLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24.9 17.2"
        className={className}
        fill="currentColor"
        role="img"
        aria-label="Honda Logo"
    >
        <path d="M24.9 9.2c-.7-.4-2.2-1.3-3-1.8-1.2-.7-2.6-1.6-3.8-2.2-1.1-.7-2.3-1.3-3.4-2-1.2-.7-2.4-1.4-3.7-2.2C10-.1 8.7-1 7.5-1c-.4 0-.8.1-1.2.2-.4.2-.8.4-1.2.7-.4.3-.7.7-1.1 1.2-.3.4-.6.9-.8 1.5-.3.7-.6 1.3-.9 2.1-.3.7-.6 1.5-.9 2.2-.3.7-.6 1.5-.9 2.2-.3.7-.6 1.4-.9 2-.2.5-.4.8-.6 1.2-.2.3-.3.6-.4.8-.1.2-.2.4-.2.6s0 .3.1.4c.1.1.2.1.4.1.5 0 1.1-.2 1.7-.6s1.2-.9 1.7-1.5c.6-.6 1.1-1.2 1.7-1.9.5-.7 1-1.4 1.5-2.1.2-.4.5-.8.7-1.2.2-.4.5-.8.7-1.2.2-.4.5-.8.7-1.2.2-.4.5-.8.7-1.2.2-.3.4-.7.6-1 .2-.3.4-.6.6-.9.2-.3.3-.4.5-.6.2-.2.3-.3.5-.4.1-.1.2-.1.4-.1.2 0 .5.1.7.2.2.2.5.4.7.6.2.2.5.5.7.9.2.3.5.7.7 1 .2.4.5.8.7 1.1.2.4.5.8.7 1.1.5.7.9 1.4 1.4 2.1.5.7.9 1.4 1.4 2.1.5.7.9 1.4 1.4 2.1.2.4.5.8.7 1.1.2.4.5.7.7 1 .2.3.5.7.7 1 .2.3.5.6.7.9.2.2.4.4.6.6.2.2.4.3.6.4.2.1.3.1.5.1.2 0 .3 0 .5-.1.2-.1.3-.2.5-.4.2-.2.3-.3.5-.5.2-.2.3-.4.5-.6.1-.2.2-.3.4-.5.1-.2.2-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.3.1-.5 0-.2-.1-.3-.1-.4z" />
    </svg>
);


// Icons for navigation items
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const CustomersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const UserManagementIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.781-4.121M12 12a4 4 0 110-8 4 4 0 010 8z" /></svg>;

interface SidebarProps {
    currentView: string;
    onNavigate: (view: 'dashboard' | 'customers' | 'usermanagement') => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, setIsOpen }) => {
    const { isAdmin } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Bảng Điều Khiển', icon: <DashboardIcon />, admin: false },
        { id: 'customers', label: 'Khách Hàng', icon: <CustomersIcon />, admin: false },
        { id: 'usermanagement', label: 'Quản Lý Người Dùng', icon: <UserManagementIcon />, admin: true },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center px-6">
                    <HondaLogo className="h-8 w-auto text-honda-red" />
                    <span className="ml-3 text-xl font-bold text-gray-800 dark:text-white">GIA HÒA 6</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(item => {
                        if (item.admin && !isAdmin) {
                            return null;
                        }
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id as 'dashboard' | 'customers' | 'usermanagement')}
                                className={`w-full flex items-center px-4 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                                    currentView === item.id
                                        ? 'bg-honda-red text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {item.icon}
                                <span className="ml-4">{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </aside>
        </>
    );
};