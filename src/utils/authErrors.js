/**
 * Centralized auth error copy used by the login and register flows.
 * @type {{ invalidCredentials: string, registrationFailed: string }}
 */
export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: 'Credenciales incorrectas',
  registrationFailed: 'Error al registrarse',
};

/**
 * Resolve an auth-facing error message for a given failure.
 *
 * @param {string} fallbackMessage
 * @param {{ response?: { status?: number } } | undefined} error
 * @returns {string}
 */
export const getAuthErrorMessage = (fallbackMessage, error) => {
  if (error?.response?.status === 401) {
    return AUTH_ERROR_MESSAGES.invalidCredentials;
  }

  return fallbackMessage;
};
