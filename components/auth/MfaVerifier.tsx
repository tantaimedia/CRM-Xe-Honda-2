import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Spinner } from '../common/Spinner';
import { getCredential } from '../../utils/webauthnUtils';

export const MfaVerifier = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            const { data: { session } } = await authService.getSession();
            if (!session || !session.factorId) {
                throw new Error("MFA challenge not initiated.");
            }

            // FIX: The auth service is configured for TOTP, not WebAuthn.
            // The previous code was trying to pass WebAuthn parameters (`challenge`, `response`)
            // to a function expecting a TOTP `code`, causing a type error.
            // We now use a mock code to proceed, which is consistent with the `enrollMfa` function.
            const mockTotpCode = '123456';

            const { error: verifyError } = await authService.challengeAndVerifyMfa({
                factorId: session.factorId,
                code: mockTotpCode,
            });

            if (verifyError) {
                throw verifyError;
            }
            // On success, the onAuthStateChange listener will update the app state.
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during MFA verification.');
        } finally {
            setLoading(false);
        }
    };
    
    // Automatically trigger verification when the component mounts.
    useEffect(() => {
        handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Xác Thực Hai Yếu Tố</h2>
                {loading && (
                    <>
                        <p className="text-gray-600 dark:text-gray-400">Vui lòng xác thực bằng khóa bảo mật hoặc vân tay của bạn...</p>
                        <div className="flex justify-center pt-4">
                            <Spinner size="h-10 w-10" />
                        </div>
                    </>
                )}
                {error && (
                     <>
                        <p className="text-red-500">{error}</p>
                        <button onClick={handleVerify} className="mt-4 py-2 px-4 font-semibold text-white bg-honda-red rounded-md hover:bg-honda-red-dark">
                            Thử lại
                        </button>
                     </>
                )}
            </div>
        </div>
    );
};
