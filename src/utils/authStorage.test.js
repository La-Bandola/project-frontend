import { clearAuthTokens, getStoredToken, persistAuthTokens, STORAGE_KEYS } from './authStorage'

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and reads auth tokens', () => {
    persistAuthTokens('access-token', 'refresh-token')

    expect(getStoredToken()).toBe('access-token')
    expect(getStoredToken(STORAGE_KEYS.refreshToken)).toBe('refresh-token')
  })

  it('clears stored auth tokens', () => {
    persistAuthTokens('access-token', 'refresh-token')

    clearAuthTokens()

    expect(getStoredToken()).toBeNull()
    expect(getStoredToken(STORAGE_KEYS.refreshToken)).toBeNull()
  })
})
