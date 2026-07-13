import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Rutas públicas: no llevan token y no disparan el flujo de refresh
const AUTH_URLS = ['/users/login/', '/users/register/', '/users/token/refresh/']

const isAuthUrl = (url = '') => AUTH_URLS.some((u) => url.includes(u))

const clearSessionAndRedirect = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  // Solo redirige si no estamos ya en login/register
  if (
    !window.location.pathname.startsWith('/login') &&
    !window.location.pathname.startsWith('/register')
  ) {
    window.location.href = '/login'
  }
}

// Agrega el token JWT a cada request (excepto rutas públicas)
api.interceptors.request.use((config) => {
  if (!isAuthUrl(config.url)) {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Si el access token expiró, intenta renovarlo con el refresh token.
// Si el refresh también es inválido (ej: DB reseteada), limpia la sesión y redirige.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthUrl(original.url)
    ) {
      original._retry = true

      const refresh = localStorage.getItem('refresh_token')

      // Sin refresh token → limpiar y redirigir directamente
      if (!refresh) {
        clearSessionAndRedirect()
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          'http://localhost:8000/api/users/token/refresh/',
          { refresh }
        )
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        // Refresh también falló → cerrar sesión
        clearSessionAndRedirect()
      }
    }

    return Promise.reject(error)
  }
)

export default api