declare global {
    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    renderButton: (parent: HTMLElement, options: any) => void;
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
        // Render Google's own button into an offscreen container and click it programmatically.
        // This drives the standard OAuth popup flow, which works reliably inside sandboxed
        // preview iframes (e.g. Replit's preview pane) where the One Tap/FedCM prompt API
        // (`google.accounts.id.prompt`) is blocked by the iframe's permissions policy.
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        document.body.appendChild(container);

        const cleanup = () => {
            container.remove();
        };

        try {
            window.google.accounts.id.initialize({
                client_id: resolvedClientId,
                callback: (response: { credential?: string }) => {
                    cleanup();
                    if (response?.credential) {
                        resolve(response.credential);
                    } else {
                        reject(new Error('Google sign-in was canceled.'));
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: false,
            });

            window.google.accounts.id.renderButton(container, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
            });

            // Give the button a tick to render, then click its inner <div role="button">.
            setTimeout(() => {
                const clickable = container.querySelector<HTMLElement>('div[role="button"]');
                if (clickable) {
                    clickable.click();
                } else {
                    cleanup();
                    reject(new Error('Google sign-in could not be shown. Please try again.'));
                }
            }, 50);
        } catch (error: any) {
            cleanup();
            reject(new Error(error?.message || 'Google sign-in failed.'));
        }
    });
};
