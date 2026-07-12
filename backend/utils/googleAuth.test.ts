import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveGoogleClientId, extractGoogleProfile } from './googleAuth';

test('resolveGoogleClientId prefers an explicit Google client id', () => {
    const clientId = resolveGoogleClientId({ GOOGLE_CLIENT_ID: 'server-client-id', VITE_GOOGLE_CLIENT_ID: 'client-id' } as NodeJS.ProcessEnv);
    assert.equal(clientId, 'server-client-id');
});

test('extractGoogleProfile derives profile fields from a verified Google payload', () => {
    const profile = extractGoogleProfile({
        email: 'student@example.com',
        given_name: 'Abebe',
        family_name: 'Kebede',
        picture: 'https://example.com/avatar.png',
    });

    assert.deepEqual(profile, {
        email: 'student@example.com',
        first_name: 'Abebe',
        last_name: 'Kebede',
        profile_picture: 'https://example.com/avatar.png',
    });
});
