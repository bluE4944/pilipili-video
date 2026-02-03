import { apiRequest } from '@/utils/api'

export function login(params) {
  return apiRequest.post('/api/auth/login', params)
}
