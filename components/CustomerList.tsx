import React, { useState, useMemo } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Customer, CustomerStatus } from '../types';
import { Spinner } from './common/Spinner';
import { Modal } from './common/Modal';
import { CustomerForm } from './CustomerForm';
import { exportCustomersToPDF } from '../services/pdfService';

interface CustomerListProps {
    onSelectCustomer: (customer: Customer) => void;
}

const getStatusBadge = (status: CustomerStatus) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case CustomerStatus.New:
            return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100`;
        case CustomerStatus.Contacted:
            return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100`;
        case CustomerStatus.Potential:
            return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100`;
        case CustomerStatus.Closed:
            return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100`;
        case CustomerStatus.Lost:
            return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100`;
    }
};

export const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
    const { customers, loading, error } = useCustomers();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');

    const filteredCustomers = useMemo(() => {
        return customers
            .filter(customer => {
                if (statusFilter !== 'all' && customer.status !== statusFilter) {
                    return false;
                }
                if (searchTerm === '') {
                    return true;
                }
                const lowercasedSearch = searchTerm.toLowerCase();
                return (
                    customer.fullName.toLowerCase().includes(lowercasedSearch) ||
                    customer.phone.toLowerCase().includes(lowercasedSearch) ||
                    customer.preferredModel.toLowerCase().includes(lowercasedSearch)
                );
            });
    }, [customers, searchTerm, statusFilter]);
    
    const handleExport = () => {
        if (filteredCustomers.length > 0) {
            exportCustomersToPDF(filteredCustomers);
        } else {
            alert("Không có khách hàng nào để xuất file PDF.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="h-12 w-12" /></div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">Lỗi: {error}</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                     <input
                        type="text"
                        placeholder="Tìm kiếm khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-honda-red dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
                         className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-honda-red dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {(Object.values(CustomerStatus) as CustomerStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        className="w-1/2 md:w-auto flex-1 md:flex-initial justify-center py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                       Xuất PDF
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-1/2 md:w-auto flex-1 md:flex-initial justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-honda-red hover:bg-honda-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-honda-red"
                    >
                        Thêm Mới
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Desktop Table View */}
                <table className="hidden md:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Khách Hàng</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Xe Quan Tâm</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng Thái</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày Tạo</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} onClick={() => onSelectCustomer(customer)} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.fullName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.preferredModel || 'Chưa có'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getStatusBadge(customer.status)}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                 {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                     {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <div 
                                key={customer.id} 
                                onClick={() => onSelectCustomer(customer)} 
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm cursor-pointer active:bg-gray-100 dark:active:bg-gray-700"
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && onSelectCustomer(customer)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{customer.fullName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
                                    </div>
                                    <span className={getStatusBadge(customer.status)}>{customer.status}</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <p>Xe: {customer.preferredModel || 'Chưa có'}</p>
                                    <p className="mt-1 text-xs text-gray-400">Ngày tạo: {new Date(customer.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">Không tìm thấy khách hàng nào.</div>
                    )}
                </div>
                
                 {filteredCustomers.length === 0 && (
                     <div className="hidden md:block">
                        <p className="py-8 text-center text-gray-500 dark:text-gray-400">Không tìm thấy khách hàng nào.</p>
                     </div>
                 )}

            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Thêm Khách Hàng Mới">
                <CustomerForm onSuccess={() => setIsAddModalOpen(false)} />
            </Modal>
        </div>
    );
};