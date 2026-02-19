import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Fallback: some OAuth flows return tokens in URL hash.
                // If auto-detection misses it, set session manually.
                const hash = window.location.hash.startsWith('#')
                    ? window.location.hash.slice(1)
                    : window.location.hash;
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (error) {
                        console.error('Error setting session from callback hash:', error);
                    }
                }

                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error during auth callback:', error);
                }

                if (!session) {
                    // Give Supabase a short moment to finish processing auth state.
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }

                navigate('/', { replace: true });
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
