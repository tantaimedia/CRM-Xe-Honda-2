import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { Customer } from '../types';

// --- Notification Service ---
// Provides a simple wrapper around the browser's Notification API.
export const notificationService = {
    isSupported: () => 'Notification' in window,
    requestPermission: async (): Promise<NotificationPermission> => {
        if (!notificationService.isSupported()) {
            console.warn('Browser notifications are not supported.');
            return 'denied';
        }
        return await Notification.requestPermission();
    },
    showNotification: (title: string, options?: NotificationOptions) => {
        if (!notificationService.isSupported() || Notification.permission !== 'granted') {
            return;
        }
        new Notification(title, {
            ...options,
            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNC45IDE3LjIiIGZpbGw9IiNFNTAwMkIiPjxwYXRoIGQ9Ik0yNC45IDkuMmMtLjctLjQtMi4yLTEuMy0zLTEuOC0xLjItLjctMi42LTEuNi0zLjgtMi4yLTEuMS0uNy0yLjMtMS4zLTMuNC0yLTEuMi0uNy0yLjQtMS40LTMuNy0yLjJDMTAtLjEgOC43LTEgNy41LTFjLS40IDAtLjguMS0xLjIuMi0uNC4yLS44LjQtMS4yLjctLjQuMy0uNy43LTEuMSAxLjItLjMuNC0uNi45LS44IDEuNS0uMy43LS42IDEuMy0uOSAyLjEtLjMuNy0uNiAxLjUtLjkgMi4yLS4zLjctLjYgMS41LS45IDIuMi0uMy43LS42IDEuNC0uOSAyLS4yLjUtLjQuOC0uNiAxLjItLjIuMy0uMy42LS40LjgtLjEuMi0uMi40LS4yLjZzMCAuMy4xLjRjLjEuMS4yLjEuNC4xLjUgMCAxLjEtLjIgMS43LS42czEuMi0uOSAxLjctMS41Yy42LS42IDEuMS0xLjIgMS43LTEuOS41LS43IDEtMS40IDEuNS0yLjEuMi0uNC41LS44LjctMS4yLjItLjQuNS0uOC43LTEuMi4yLS40LjUtLjguNy0xLjIuMi0uNC41LS44LjctMS4yLjItLjMuNC0uNy42LTEgLjItLjMuNC0uNi42LS45LjItLjMuMy0uNC41LS42LjItLjIuMy0uMy41LS40LjEtLjEuMi0uMS40LS4xLjIgMCAuNS4xLjcuMi4yLjIuNS40LjcuNi4yLjIuNS41LjcuOS4yLjMuNS43LjcgMSAuMi40LjUuOC43IDEuMS4yLjQuNS44LjcgMS4xLjUuNy45IDEuNCAxLjQgMi4xLjUuNy45IDEuNCAxLjQgMi4xLjUuNy45IDEuNCAxLjQgMi4xLjIuNC41LjguNyAxLjEuMi40LjUuNy43IDEgLjIuMy41LjcuNyAxIC4yLjMuNS42LjcuOS4yLjIuNC40LjYuNi4yLjIuNC4zLjYuNC4yLjEuMy4xLjUuMS4yIDAgLjMgMCAuNS0uMS4yLS4xLjMtLjIuNS0uNC4yLS4yLjMtLjMuNS0uNS4yLS4yLjMtLjQuNS0uNi4xLS4yLjItLjMuNC0uNS4xLS4yLjItLjMuNC0uNS4xLS4yLjItLjMuMy0uNS4xLS4yLjEtLjMuMS0uNSAwLS4yLS4xLS4zLS4xLS40eiIvPjwvczenPg==', // Using the app's logo
        });
    },
};
// --- End Notification Service ---

interface CustomerContextType {
    customers: Customer[];
    loading: boolean;
    error: string | null;
    addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateCustomer: (customer: Partial<Customer> & { id: number }) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase.from('customers').select('*');
            if (fetchError) throw new Error(fetchError.message);
            if (data) {
                setCustomers(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
        
        const subscription = supabase.channel('public:customers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchCustomers)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [fetchCustomers]);

    const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'status'>) => {
        try {
            const { data, error: insertError } = await supabase.from('customers').insert({ ...customerData, status: 'Mới' }).select();
            if (insertError) throw new Error(insertError.message);
            if (data && data[0]) {
                notificationService.showNotification(
                    'Khách hàng mới!',
                    { body: `${data[0].fullName} vừa được thêm vào hệ thống.` }
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add customer');
            throw err;
        }
    };
    
    const updateCustomer = async (customerData: Partial<Customer> & { id: number }) => {
        try {
            const { error: updateError } = await supabase.from('customers').update(customerData).eq('id', customerData.id);
            if (updateError) throw new Error(updateError.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update customer');
            throw err;
        }
    };

    // FIX: Replaced JSX with React.createElement because this is a .ts file, not .tsx.
    return React.createElement(CustomerContext.Provider, {
      value: { customers, loading, error, addCustomer, updateCustomer }
    }, children);
};

export const useCustomers = (): CustomerContextType => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
};
