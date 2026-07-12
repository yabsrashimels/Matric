import test from 'node:test';
import assert from 'node:assert/strict';
import { generateVerificationCode, isVerificationExpired } from './helpers';

test('generateVerificationCode returns a 6-digit code', () => {
    const code = generateVerificationCode();
    assert.match(code, /^\d{6}$/);
});

test('isVerificationExpired detects expiry correctly', () => {
    const fresh = new Date(Date.now() + 5 * 60 * 1000);
    const expired = new Date(Date.now() - 5 * 60 * 1000);

    assert.equal(isVerificationExpired(fresh), false);
    assert.equal(isVerificationExpired(expired), true);
});
