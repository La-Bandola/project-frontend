export const STORAGE_KEYS = Object.freeze({
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
})

export const getStoredToken = (storageKey = STORAGE_KEYS.accessToken) => {
  return localStorage.getItem(storageKey)
}

export const persistAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}

export const clearAuthTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
}
