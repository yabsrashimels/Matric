import { OAuth2Client } from 'google-auth-library';

export interface GoogleProfile {
    google_id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
}

export class GoogleAuthError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 401) {
        super(message);
        this.name = 'GoogleAuthError';
        this.statusCode = statusCode;
    }
}

export const resolveGoogleClientId = (env: NodeJS.ProcessEnv = process.env): string => {
    return String(env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || '').trim();
};

export const extractGoogleProfile = (payload: Record<string, unknown> = {}): GoogleProfile => {
    const givenName = String(payload.given_name || payload.first_name || '').trim();
    const familyName = String(payload.family_name || payload.last_name || '').trim();
    const fullName = String(payload.name || '').trim();
    const nameParts = fullName ? fullName.split(/\s+/) : [];

    return {
        google_id: String(payload.sub || payload.google_id || '').trim(),
        email: String(payload.email || '').trim().toLowerCase(),
        first_name: givenName || nameParts[0] || 'Google',
        last_name: familyName || nameParts.slice(1).join(' ') || 'User',
        profile_picture: String(payload.picture || payload.profile_picture || '').trim(),
    };
};

let cachedClientId: string | null = null;
let cachedOAuthClient: OAuth2Client | null = null;

const getOAuthClient = (clientId: string): OAuth2Client => {
    if (!cachedOAuthClient || cachedClientId !== clientId) {
        cachedOAuthClient = new OAuth2Client(clientId);
        cachedClientId = clientId;
    }
    return cachedOAuthClient;
};

export const verifyGoogleCredential = async (
    credential: string,
    clientId?: string
): Promise<GoogleProfile> => {
    const resolvedClientId = clientId || resolveGoogleClientId();

    if (!credential || typeof credential !== 'string') {
        throw new GoogleAuthError('Google ID token is required.', 400);
    }

    if (!resolvedClientId) {
        throw new GoogleAuthError('Google sign-in is not configured on the server.', 503);
    }

    try {
        const client = getOAuthClient(resolvedClientId);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: resolvedClientId,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new GoogleAuthError('Google sign-in token is invalid or has expired. Please try again.');
        }

        if (!payload.email) {
            throw new GoogleAuthError('Google account email is missing from the verified token.');
        }

        if (payload.email_verified !== true && payload.email_verified !== 'true') {
            throw new GoogleAuthError('Your Google email address must be verified before signing in.');
        }

        if (!payload.sub) {
            throw new GoogleAuthError('Google account identifier is missing from the verified token.');
        }

        const profile = extractGoogleProfile(payload as Record<string, unknown>);
        if (!profile.google_id || !profile.email) {
            throw new GoogleAuthError('Google sign-in could not be verified.');
        }

        return profile;
    } catch (error) {
        if (error instanceof GoogleAuthError) {
            throw error;
        }

        const message = error instanceof Error ? error.message : 'Unknown Google verification error';
        if (/expired/i.test(message)) {
            throw new GoogleAuthError('Google sign-in token has expired. Please try again.');
        }
        if (/audience/i.test(message)) {
            throw new GoogleAuthError('Google sign-in token audience is invalid.');
        }

        throw new GoogleAuthError('Invalid or expired Google sign-in token. Please try again.');
    }
};
