import React, { useState, useEffect, useMemo } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Customer, CustomerStatus } from '../types';
import { Spinner } from './common/Spinner';

const HONDA_MODELS_DATA = [
      { name: 'Air Blade', variants: ['125cc', '160cc'] },
      { name: 'Blade', variants: [] },
      { name: 'Future 125 FI', variants: [] },
      { name: 'LEAD 125 FI', variants: [] },
      { name: 'SH', variants: ['125i', '160i'] },
      { name: 'SH Mode 125cc', variants: [] },
      { name: 'Vario', variants: ['125cc', '160cc'] },
      { name: 'Vision', variants: [] },
      { name: 'Wave Alpha 110cc', variants: [] },
      { name: 'Wave RSX FI 110cc', variants: [] },
      { name: 'Winner', variants: ['X', 'R'] },
].sort((a, b) => a.name.localeCompare(b.name));

interface CustomerFormProps {
    customer?: Customer;
    onSuccess: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSuccess }) => {
    const { addCustomer, updateCustomer } = useCustomers();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        preferredModel: '',
        preferredColor: '',
        reasonNotBuying: '',
        status: CustomerStatus.New,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedModelName, setSelectedModelName] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');

    const isEditMode = !!customer;

    useEffect(() => {
        if (isEditMode && customer) {
            setFormData({
                fullName: customer.fullName,
                phone: customer.phone,
                preferredModel: customer.preferredModel,
                preferredColor: customer.preferredColor,
                reasonNotBuying: customer.reasonNotBuying,
                status: customer.status,
            });
            
            const modelString = (customer.preferredModel || '').replace(/^Honda\s/i, '');
            let modelName = '';
            let variant = '';
            
            const matchingModel = HONDA_MODELS_DATA.find(m => modelString.startsWith(m.name));
            
            if (matchingModel) {
                modelName = matchingModel.name;
                const remaining = modelString.substring(modelName.length).trim();
                if (matchingModel.variants.includes(remaining)) {
                    variant = remaining;
                }
            }
            
            setSelectedModelName(modelName);
            setSelectedVariant(variant);
        }
    }, [customer, isEditMode]);
    
    useEffect(() => {
        const modelData = HONDA_MODELS_DATA.find(m => m.name === selectedModelName);
        if (!modelData) {
             if (formData.preferredModel !== '') {
                setFormData(prev => ({ ...prev, preferredModel: '' }));
            }
            return;
        }

        let newPreferredModel = selectedModelName;
        if (modelData.variants.length > 0 && selectedVariant) {
            newPreferredModel = `${selectedModelName} ${selectedVariant}`;
        }
        
        if (newPreferredModel !== formData.preferredModel) {
             setFormData(prev => ({ ...prev, preferredModel: newPreferredModel }));
        }
    }, [selectedModelName, selectedVariant, formData.preferredModel]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newModelName = e.target.value;
        setSelectedModelName(newModelName);
        
        const modelData = HONDA_MODELS_DATA.find(m => m.name === newModelName);
        if (modelData && modelData.variants.length > 0) {
            setSelectedVariant(modelData.variants[0]);
        } else {
            setSelectedVariant('');
        }
    };

    const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVariant(e.target.value);
    };
    
    const currentModelVariants = useMemo(() => {
        if (!selectedModelName) return [];
        const modelData = HONDA_MODELS_DATA.find(m => m.name === selectedModelName);
        return modelData ? modelData.variants : [];
    }, [selectedModelName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditMode && customer) {
                await updateCustomer({ id: customer.id, ...formData });
            } else {
                await addCustomer({
                    fullName: formData.fullName,
                    phone: formData.phone,
                    preferredModel: formData.preferredModel,
                    preferredColor: formData.preferredColor,
                    reasonNotBuying: formData.reasonNotBuying,
                });
            }
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</label>
                <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
                <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="preferredModelSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mẫu xe quan tâm</label>
                <select
                    id="preferredModelSelect"
                    value={selectedModelName}
                    onChange={handleModelChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                >
                    <option value="">-- Chọn mẫu xe --</option>
                    {HONDA_MODELS_DATA.map(model => (
                        <option key={model.name} value={model.name}>{model.name}</option>
                    ))}
                </select>
            </div>
            {currentModelVariants.length > 0 && (
                 <div>
                    <label htmlFor="modelVariant" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phiên bản</label>
                    <select
                        id="modelVariant"
                        value={selectedVariant}
                        onChange={handleVariantChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                    >
                        {currentModelVariants.map(variant => (
                            <option key={variant} value={variant}>{variant}</option>
                        ))}
                    </select>
                </div>
            )}
            <div>
                <label htmlFor="preferredColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Màu sắc ưa thích</label>
                <input
                    type="text"
                    name="preferredColor"
                    id="preferredColor"
                    value={formData.preferredColor}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="reasonNotBuying" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lý do chưa chốt</label>
                <textarea
                    name="reasonNotBuying"
                    id="reasonNotBuying"
                    rows={3}
                    value={formData.reasonNotBuying}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                ></textarea>
            </div>
            {isEditMode && (
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm"
                    >
                        {(Object.values(CustomerStatus) as CustomerStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-honda-red py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-honda-red-dark focus:outline-none focus:ring-2 focus:ring-honda-red focus:ring-offset-2 disabled:bg-gray-400"
                >
                    {loading ? <Spinner size="h-5 w-5" /> : (isEditMode ? 'Lưu Thay Đổi' : 'Thêm Khách Hàng')}
                </button>
            </div>
        </form>
    );
};
