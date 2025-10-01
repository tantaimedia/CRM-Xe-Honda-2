import { User, Session } from '../types';
import { supabase } from './supabaseClient';
import { GoTrueClient, Session as SupabaseSession, User as SupabaseUser, AuthError } from '@supabase/supabase-js';


export type MfaStatus = 'unverified' | 'verified' | 'not_enrolled';

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    mfaStatus: MfaStatus;
    isAdmin: boolean;
}

// Helper to map Supabase user to our app's User type
const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: (supabaseUser.app_metadata?.claims_admin || supabaseUser.user_metadata?.role === 'admin') ? 'admin' : 'user',
        app_metadata: supabaseUser.app_metadata,
        user_metadata: supabaseUser.user_metadata,
        aud: supabaseUser.aud,
        created_at: supabaseUser.created_at,
    };
};

// --- REAL AUTH SERVICE ---
export const authService = {
    onAuthStateChange: (callback: (state: AuthState) => void): (() => void) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const authState = await authService.createAuthState(session);
            callback(authState);
        });

        return () => {
            subscription?.unsubscribe();
        };
    },

    getInitialState: (): AuthState => ({
        user: null,
        session: null,
        loading: true,
        mfaStatus: 'not_enrolled',
        isAdmin: false,
    }),

    createAuthState: async (session: SupabaseSession | null): Promise<AuthState> => {
        if (!session) {
            return { user: null, session: null, loading: false, mfaStatus: 'not_enrolled', isAdmin: false };
        }

        const user = mapSupabaseUser(session.user);
        const isAdmin = user.role === 'admin';
        
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        let mfaStatus: MfaStatus = 'not_enrolled';
        if (data) {
            if (data.currentLevel === 'aal2') {
                mfaStatus = 'verified';
            } else if (data.nextLevel === 'aal2') {
                mfaStatus = 'unverified';
            }
        }
         
        return { 
            user, 
            session: session as Session, // Assuming SupabaseSession is compatible
            loading: false, 
            mfaStatus,
            isAdmin 
        };
    },

    checkSession: async (): Promise<void> => {
       // Supabase client handles this automatically, onAuthStateChange will fire.
    },

    signInWithPassword: async (credentials: { email?: string; password?: string }) => {
        return supabase.auth.signInWithPassword({
             email: credentials.email!, 
             password: credentials.password! 
        });
    },

    signOut: async () => {
        return supabase.auth.signOut();
    },

    getSession: async () => {
        return supabase.auth.getSession();
    },
    
    enrollMfa: async () => {
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
        if(error) return { data, error };
        // In a real app, you would now show `data.totp.qr_code` to the user.
        // For this app's purpose, we'll auto-verify for simplicity.
        return supabase.auth.mfa.challengeAndVerify({
             factorId: data.id,
             code: '123456' // This needs a real TOTP code in a production app.
        });
    },
    
    challengeAndVerifyMfa: async (params: { factorId: string; code: string }) => {
        return supabase.auth.mfa.challengeAndVerify(params);
    },
    
    isMfaEnabled: async (): Promise<boolean> => {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        return data?.nextLevel === 'aal2' || data?.currentLevel === 'aal2';
    },

    // Admin methods - these require service_role key on a real backend
    // For client-side admin, we rely on RLS policies in Supabase.
    getUsers: async () => supabase.from('users').select(),
    createUser: async (details: any) => supabase.auth.admin.createUser({
        email: details.email,
        password: details.password_hash,
        user_metadata: { role: details.role },
        email_confirm: true, // Auto-confirm user for simplicity
    }),
};
