import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API 基础配置
// Vue CLI 使用 process.env，环境变量需要以 VUE_APP_ 开头
const API_BASE_URL = (process.env.VUE_APP_API_BASE_URL as string) || 'http://localhost:8316'

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 根据后端返回的数据结构处理
    // 如果后端返回格式为 { code: 200, data: {...}, message: '...' }
    if (response.data && typeof response.data === 'object') {
      if (response.data.code !== undefined && response.data.code !== 200) {
        // 错误信息会在调用处通过 message 组件显示
        return Promise.reject(new Error(response.data.message || '请求失败'))
      }
      // 返回 data 字段的内容
      return response.data.data !== undefined ? response.data : response
    }
    return response
  },
  (error) => {
    // 错误信息会在调用处通过 message 组件显示
    // 这里只处理需要特殊处理的错误（如401清除token）
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        // 清除token，调用处会处理跳转
        localStorage.removeItem('token')
      }
    }
    
    return Promise.reject(error)
  }
)

// API 请求封装
export const apiRequest = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get(url, config).then(res => res.data || res)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post(url, data, config).then(res => res.data || res)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put(url, data, config).then(res => res.data || res)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete(url, config).then(res => res.data || res)
  },
  
  // 文件上传
  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    }).then(res => res.data || res)
  }
}

export default apiClient
