import React, { useState, useEffect } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerStatus } from '../types';
import { getDailyHoroscope, getColorFengShui } from '../services/geminiService';
import { Spinner } from './common/Spinner';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-honda-red p-3 rounded-full text-white">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);
const NewIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
);
const PotentialIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
);
const ClosedIcon = () => (
     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);


export const Dashboard: React.FC = () => {
    const { customers, loading } = useCustomers();
    const [horoscope, setHoroscope] = useState('');
    const [horoscopeLoading, setHoroscopeLoading] = useState(true);
    const [birthYear, setBirthYear] = useState('');
    const [fengShui, setFengShui] = useState('');
    const [fengShuiLoading, setFengShuiLoading] = useState(false);

    useEffect(() => {
        const fetchHoroscope = async () => {
            setHoroscopeLoading(true);
            const text = await getDailyHoroscope();
            setHoroscope(text);
            setHoroscopeLoading(false);
        };
        fetchHoroscope();
    }, []);
    
    const handleFengShuiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!birthYear) return;
        setFengShuiLoading(true);
        const text = await getColorFengShui(birthYear);
        setFengShui(text);
        setFengShuiLoading(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="h-12 w-12" /></div>;
    }

    const stats = {
        total: customers.length,
        new: customers.filter(c => c.status === CustomerStatus.New).length,
        potential: customers.filter(c => c.status === CustomerStatus.Potential).length,
        closed: customers.filter(c => c.status === CustomerStatus.Closed).length,
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bảng Điều Khiển</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng Khách Hàng" value={stats.total} icon={<UsersIcon />} />
                <StatCard title="Khách Hàng Mới" value={stats.new} icon={<NewIcon />} />
                <StatCard title="Tiềm Năng" value={stats.potential} icon={<PotentialIcon />} />
                <StatCard title="Đã Chốt" value={stats.closed} icon={<ClosedIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Góc Tâm Linh 🔮</h3>
                     <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                        <p className="font-semibold text-honda-red dark:text-red-400">Lời khuyên trong ngày:</p>
                        {horoscopeLoading ? <Spinner size="h-5 w-5" /> : <p className="italic text-gray-700 dark:text-gray-300 mt-2">{horoscope}</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tư Vấn Phong Thủy 🎨</h3>
                    <form onSubmit={handleFengShuiSubmit} className="flex items-end gap-4">
                        <div className="flex-grow">
                             <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Năm sinh khách hàng</label>
                            <input
                                id="birthYear"
                                type="number"
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                placeholder="Ví dụ: 1990"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                            />
                        </div>
                        <button type="submit" disabled={fengShuiLoading || !birthYear} className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-honda-red hover:bg-honda-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-honda-red disabled:bg-gray-400">
                           {fengShuiLoading ? <Spinner size="h-5 w-5" /> : 'Xem màu hợp'}
                        </button>
                    </form>
                     {fengShui && !fengShuiLoading && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-800 dark:text-gray-200">{fengShui}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
