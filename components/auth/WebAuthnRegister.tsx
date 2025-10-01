import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Spinner } from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';

export const WebAuthnRegister = () => {
    const { user } = useAuth();
    const [isMfaEnabled, setIsMfaEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkMfaStatus = async () => {
            if (!user) return;
            setLoading(true);
            const status = await authService.isMfaEnabled();
            setIsMfaEnabled(status);
            setLoading(false);
        };
        checkMfaStatus();
    }, [user]);

    const handleEnableMfa = async () => {
        setLoading(true);
        setError('');
        try {
            const { error: enrollError } = await authService.enrollMfa();
            if (enrollError) throw enrollError;
            alert("Kích hoạt MFA thành công!");
            setIsMfaEnabled(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể kích hoạt MFA.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-sm text-gray-500">...</div>;
    }

    if (isMfaEnabled) {
        return <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ 2FA Đã Bật</span>;
    }

    return (
        <div>
            <button 
                onClick={handleEnableMfa} 
                className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
                disabled={loading}
            >
                {loading ? <Spinner size="h-4 w-4" /> : 'Kích hoạt 2FA'}
            </button>
             {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};
