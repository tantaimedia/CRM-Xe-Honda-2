import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useTheme } from '../hooks/useTheme';
import { WebAuthnRegister } from './auth/WebAuthnRegister';
import { LiveConversation } from './LiveConversation';
import { HondaLogo } from './Sidebar';

const SunIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
const MoonIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>;
const MicrophoneIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;

export const Header: React.FC<{ title: string; onMenuClick: () => void }> = ({ title, onMenuClick }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isLiveConversationOpen, setIsLiveConversationOpen] = useState(false);

    const handleLogout = async () => {
        await authService.signOut();
    };

    return (
        <>
            <header className="flex items-center justify-between h-20 px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 mr-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MenuIcon />
                    </button>
                    <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 truncate">{title}</h1>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <HondaLogo className="h-8 w-auto text-honda-red hidden lg:block" />
                    <button onClick={() => setIsLiveConversationOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                       <MicrophoneIcon />
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                    <div className="relative">
                        <div className="flex items-center space-x-2">
                            <div className="text-right hidden sm:block">
                               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                               <WebAuthnRegister />
                            </div>
                             <button
                                onClick={handleLogout}
                                className="py-2 px-4 text-sm font-medium text-white bg-honda-red rounded-md hover:bg-honda-red-dark"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <LiveConversation isOpen={isLiveConversationOpen} onClose={() => setIsLiveConversationOpen(false)} />
        </>
    );
};