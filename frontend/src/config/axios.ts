import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { store } from '../config/store'
import { clearTokens, setTokens } from '../features/auth/authSlice'
import type { AuthTokens } from '../features/auth/authTypes'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5261'
const storageKey = 'auth'

const getStoredTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

const persistTokens = (tokens: AuthTokens | null) => {
  if (!tokens) {
    localStorage.removeItem(storageKey)
    return
  }

  localStorage.setItem(storageKey, JSON.stringify(tokens))
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials:true
})

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials:true
})

let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

const resolveQueue = (token: string | null) => {
  pendingQueue.forEach((callback) => callback(token))
  pendingQueue = []
}

apiClient.interceptors.request.use((config) => {
  const tokens = getStoredTokens()
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const tokens = getStoredTokens()
    if (!tokens?.accessToken) {
      store.dispatch(clearTokens())
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error)
            return
          }
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`
          }
          resolve(apiClient(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshResponse = await refreshClient.post<AuthTokens>('/api/v1/auth/refresh', )

      const newTokens = refreshResponse.data.data
      persistTokens(newTokens)
      store.dispatch(setTokens(newTokens))
      resolveQueue(newTokens.accessToken)

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newTokens.accessToken}`
      }

      return apiClient(originalRequest)
    } catch (refreshError) {
      resolveQueue(null)
      persistTokens(null)
      store.dispatch(clearTokens())
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)