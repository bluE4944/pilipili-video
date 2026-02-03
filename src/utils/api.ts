import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API base config
// Vue CLI uses process.env, variables must start with VUE_APP_
const API_BASE_URL = (process.env.VUE_APP_API_BASE_URL as string) || 'http://localhost:8316'

type ApiResult<T> = {
  status: number
  message: string
  body: T
  success: boolean
}

const isApiResult = (value: any): value is ApiResult<any> => {
  return value && typeof value === 'object' && 'status' in value && 'success' in value && 'body' in value
}

const unwrapApiResult = <T>(value: any): T => {
  if (isApiResult(value)) {
    if (!value.success || value.status !== 200) {
      throw new Error(value.message || 'Request failed')
    }
    return value.body as T
  }
  return value as T
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
      }
    }
    return Promise.reject(error)
  }
)

// API request helpers
export const apiRequest = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get(url, config).then(res => unwrapApiResult<T>(res.data ?? res))
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post(url, data, config).then(res => unwrapApiResult<T>(res.data ?? res))
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put(url, data, config).then(res => unwrapApiResult<T>(res.data ?? res))
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete(url, config).then(res => unwrapApiResult<T>(res.data ?? res))
  },

  // File upload
  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const headers = {
      ...config?.headers
    } as Record<string, any>
    delete headers['Content-Type']
    delete headers['content-type']

    return apiClient.post(url, formData, {
      ...config,
      headers,
      transformRequest: (data, requestHeaders) => {
        if (requestHeaders) {
          delete (requestHeaders as Record<string, any>)['Content-Type']
          delete (requestHeaders as Record<string, any>)['content-type']
        }
        return data
      }
    }).then(res => unwrapApiResult<T>(res.data ?? res))
  }
}

export default apiClient
