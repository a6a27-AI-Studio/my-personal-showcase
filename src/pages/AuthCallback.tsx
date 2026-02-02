import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the OAuth callback
        const handleCallback = async () => {
            try {
                // Supabase automatically handles the callback via onAuthStateChange
                // We just need to wait a moment for the session to be set
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error during auth callback:', error);
                    navigate('/', { replace: true });
                    return;
                }

                if (session) {
                    console.log('Authentication successful!');
                    // Redirect to home page after successful login
                    navigate('/', { replace: true });
                } else {
                    // No session found, redirect to home
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Unexpected error during auth callback:', error);
                navigate('/', { replace: true });
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-lg text-muted-foreground">正在處理登入...</p>
            </div>
        </div>
    );
}
