
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { Spinner } from './common/Spinner';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error: fetchError } = await authService.getUsers();
            if (fetchError) throw fetchError;
            setUsers(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');
        try {
            const { error: createError } = await authService.createUser({ email, password_hash: password, role });
            if (createError) throw createError;
            setFormSuccess(`Tạo tài khoản ${email} thành công!`);
            // Reset form and refresh list
            setEmail('');
            setPassword('');
            setRole('user');
            await fetchUsers();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to create user.');
        } finally {
            setFormLoading(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Danh Sách Người Dùng</h2>
                {loading && <Spinner />}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vai Trò</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày Tạo</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tạo Người Dùng Mới</h2>
                 <form onSubmit={handleCreateUser} className="space-y-4">
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
                        <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò</label>
                        <select id="role" name="role" value={role} onChange={e => setRole(e.target.value as 'user' | 'admin')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-honda-red focus:ring-honda-red sm:text-sm">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {formError && <p className="text-sm text-red-500">{formError}</p>}
                    {formSuccess && <p className="text-sm text-green-500">{formSuccess}</p>}

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={formLoading} className="inline-flex justify-center rounded-md border border-transparent bg-honda-red py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-honda-red-dark focus:outline-none focus:ring-2 focus:ring-honda-red focus:ring-offset-2 disabled:bg-gray-400">
                           {formLoading ? <Spinner size="h-5 w-5" /> : 'Tạo Tài Khoản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
