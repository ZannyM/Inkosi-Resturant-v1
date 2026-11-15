import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const api = axios.create({ baseURL: apiUrl })

api.interceptors.request.use((config) => {
  const target = new URL(config.url, config.baseURL)
  if (target.origin !== new URL(apiUrl).origin) {
    throw new Error('Admin API requests must use the configured backend origin')
  }
  return config
})

export default api
