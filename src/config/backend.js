const DEFAULT_BACKEND_URL = 'https://doctor-backend-87d5.onrender.com'

const normalizeBackendUrl = (value) => {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '')
}

const rawBackendUrl = normalizeBackendUrl(import.meta.env.VITE_BACKEND_URL)

const isInvalidBackendUrl = (url) => {
  return !url || url.includes('github.com') || url.endsWith('.git') || !/^https?:\/\//i.test(url)
}

const backendUrl = isInvalidBackendUrl(rawBackendUrl) ? DEFAULT_BACKEND_URL : rawBackendUrl

export default backendUrl
