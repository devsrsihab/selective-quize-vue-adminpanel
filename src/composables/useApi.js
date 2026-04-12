// admin/js/admin-app/src/composables/useApi.js
import axios from 'axios'

const adminApiClient = axios.create({
  baseURL: window.ptmAdminData?.restUrl || '/wp-json/ptm/v1/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': window.ptmAdminData?.nonce || '',
  },
})

adminApiClient.interceptors.request.use(config => {
  config.headers['X-WP-Nonce'] = window.ptmAdminData?.nonce || ''
  return config
})

adminApiClient.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || 'Request failed. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export default adminApiClient
