import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Spinner } from '../common/Spinner';

export const MfaSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSetupMfa = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error: enrollError } = await authService.enrollMfa();
            if (enrollError) throw enrollError;
            
            // On successful enrollment, the auth listener should update the state,
            // and we can call onComplete to move to the main app.
            alert("Thiết lập MFA thành công!"); // Simple feedback for mock env
            onComplete();

        } catch (err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred during MFA setup.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
         <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tăng Cường Bảo Mật</h2>
                 <p className="text-gray-600 dark:text-gray-400">
                    Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố (vân tay, khóa bảo mật). 
                    Đây là bước được khuyến khích để đảm bảo an toàn dữ liệu.
                 </p>
                
                 {error && <p className="text-sm text-center text-red-500">{error}</p>}

                 <div className="flex flex-col space-y-4 pt-4">
                    <button
                        onClick={handleSetupMfa}
                        disabled={loading}
                        className="w-full py-2 px-4 font-semibold text-white bg-honda-red rounded-md hover:bg-honda-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-honda-red disabled:bg-gray-400 flex justify-center"
                    >
                        {loading ? <Spinner size="h-5 w-5" /> : 'Thiết Lập Khóa Bảo Mật'}
                    </button>
                     <button
                        onClick={onComplete}
                        disabled={loading}
                        className="w-full py-2 px-4 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                        Để Sau
                    </button>
                 </div>
            </div>
        </div>
    );
};
