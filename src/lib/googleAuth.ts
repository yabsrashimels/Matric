declare global {
    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                };
            };
        };
    }
}

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

const getGoogleClientId = (): string => {
    return String((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_GOOGLE_CLIENT_ID || '').trim();
};

export const loadGoogleIdentityScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Google sign-in is not available in this environment.'));
            return;
        }

        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Google sign-in script.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = GOOGLE_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google sign-in script.'));
        document.head.appendChild(script);
    });
};

export const signInWithGoogle = async (clientId?: string): Promise<string> => {
    const resolvedClientId = clientId || getGoogleClientId();
    if (!resolvedClientId) {
        throw new Error('Google sign-in is not configured yet. Set VITE_GOOGLE_CLIENT_ID in your environment.');
    }

    await loadGoogleIdentityScript();

    if (!window.google?.accounts?.id) {
        throw new Error('Google sign-in is unavailable right now.');
    }

    return new Promise((resolve, reject) => {
        try {
            window.google.accounts.id.initialize({
                client_id: resolvedClientId,
                callback: (response: { credential?: string }) => {
                    if (response?.credential) {
                        resolve(response.credential);
                    } else {
                        reject(new Error('Google sign-in was canceled.'));
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            window.google.accounts.id.prompt((notification: any) => {
                if (notification?.isNotDisplayed() || notification?.isSkippedMoment()) {
                    reject(new Error('Google sign-in could not be shown. Please try again.'));
                }
            });
        } catch (error: any) {
            reject(new Error(error?.message || 'Google sign-in failed.'));
        }
    });
};
