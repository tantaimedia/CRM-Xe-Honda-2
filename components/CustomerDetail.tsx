import React, { useState } from 'react';
import { Customer, CustomerStatus } from '../types';
import { AiSuggestions } from './AiSuggestions';
import { CustomerForm } from './CustomerForm';
import { Modal } from './common/Modal';

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
);


const getStatusBadge = (status: CustomerStatus) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full";
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

interface CustomerDetailProps {
    customer: Customer;
    onClose: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    return (
        <aside className="w-full md:w-1/3 xl:w-1/4 h-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Chi Tiết Khách Hàng</h3>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <CloseIcon />
                </button>
            </div>
            
            <div className="flex-grow space-y-6">
                 <div>
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{customer.fullName}</h4>
                         <span className={getStatusBadge(customer.status)}>{customer.status}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{customer.phone}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Ngày tạo: {new Date(customer.createdAt).toLocaleString()}
                    </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                     <p><strong className="font-medium text-gray-600 dark:text-gray-300">Mẫu xe quan tâm:</strong> {customer.preferredModel || 'Chưa có'}</p>
                     <p><strong className="font-medium text-gray-600 dark:text-gray-300">Màu sắc ưa thích:</strong> {customer.preferredColor || 'Chưa có'}</p>
                     <p><strong className="font-medium text-gray-600 dark:text-gray-300">Lý do chưa chốt:</strong> {customer.reasonNotBuying || 'Chưa có'}</p>
                </div>

                <AiSuggestions reason={customer.reasonNotBuying} />

            </div>

             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setIsEditModalOpen(true)} 
                    className="w-full flex items-center justify-center bg-honda-red hover:bg-honda-red-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    <EditIcon />
                    Chỉnh Sửa
                </button>
            </div>


            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Chỉnh Sửa Thông Tin">
                <CustomerForm customer={customer} onSuccess={() => setIsEditModalOpen(false)} />
            </Modal>
        </aside>
    );
};
