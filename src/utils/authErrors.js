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

  if (error?.response?.status === 400 && error.response.data) {
    const data = error.response.data;
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const firstError = data[keys[0]];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }
  }

  return fallbackMessage;
};
