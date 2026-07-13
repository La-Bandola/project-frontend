import { getAuthErrorMessage, AUTH_ERROR_MESSAGES } from './authErrors';

describe('getAuthErrorMessage', () => {
  it('returns the invalid-credentials message for 401 responses', () => {
    const message = getAuthErrorMessage('Fallback message', { response: { status: 401 } });

    expect(message).toBe(AUTH_ERROR_MESSAGES.invalidCredentials);
  });

  it('returns the fallback message for other errors', () => {
    const message = getAuthErrorMessage('Fallback message', { response: { status: 400 } });

    expect(message).toBe('Fallback message');
  });
});
