import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api'

export interface User {
  id?: string | number
  userId?: string | number
  username?: string
  email?: string
  role?: string
  roles?: string[]
  [key: string]: any
}

export interface LoginCredentials {
  username: string
  password: string
}

export function parseJwt(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length >= 2 && parts[1]) {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
      return JSON.parse(jsonPayload)
    }
  } catch {
    // ignore
  }
  return null
}

function getStoredUser(): User | null {
  const savedUser = localStorage.getItem('user')
  const savedUserId = localStorage.getItem('userId')
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser)
      if (parsed) {
        if (!parsed.userId && savedUserId) {
          parsed.userId = savedUserId
        }
        if (!parsed.id && (parsed.userId || savedUserId)) {
          parsed.id = parsed.userId || savedUserId
        }
        if (!parsed.userId && !parsed.id) {
          const token = localStorage.getItem('token') || localStorage.getItem('access_token')
          if (token) {
            const payload = parseJwt(token)
            const extractedId =
              payload?.userId ??
              payload?.id ??
              payload?.user_id ??
              payload?.employeeId ??
              (payload?.sub && !isNaN(Number(payload.sub)) ? payload.sub : null)
            if (extractedId != null) {
              parsed.id = extractedId
              parsed.userId = extractedId
            }
          }
        }
      }
      return parsed
    } catch {
      return null
    }
  }
  return null
}

function getStoredRoles(): string[] {
  const savedRoles = localStorage.getItem('roles')
  if (savedRoles) {
    try {
      const parsed = JSON.parse(savedRoles)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // ignore
    }
  }
  const user = getStoredUser()
  if (user?.roles && Array.isArray(user.roles)) {
    return user.roles
  }
  if (user?.role) {
    return [user.role]
  }
  return []
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(
    localStorage.getItem('token') || localStorage.getItem('access_token') || null,
  )
  const user = ref<User | null>(getStoredUser())
  const roles = ref<string[]>(getStoredRoles())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => roles.value.includes('ROLE_ADMIN'))
  const isEmployee = computed(() => roles.value.includes('ROLE_EMPLOYEE'))

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post('/api/login', {
        username: credentials.username,
        password: credentials.password,
      })

      const data = response.data
      const receivedToken = data.access_token || data.token || data.jwt

      if (receivedToken) {
        token.value = receivedToken
        localStorage.setItem('token', receivedToken)
        localStorage.setItem('access_token', receivedToken)
      }

      // Parse roles array from the response (e.g. data.roles = ['ROLE_ADMIN'] or array of role objects)
      const rawRoles = data.roles || data.user?.roles || (data.role ? [data.role] : [])
      let parsedRoles: string[] = []

      if (Array.isArray(rawRoles)) {
        parsedRoles = rawRoles
          .map((r: any) => (typeof r === 'string' ? r : r.name || r.authority || r.role || ''))
          .filter(Boolean)
      } else if (typeof rawRoles === 'string') {
        parsedRoles = [rawRoles]
      }

      roles.value = parsedRoles
      localStorage.setItem('roles', JSON.stringify(parsedRoles))

      const tokenPayload = receivedToken ? parseJwt(receivedToken) : null
      const resolvedUserId =
        data.userId ??
        data.id ??
        data.employeeId ??
        data.user?.userId ??
        data.user?.id ??
        data.user?.employeeId ??
        tokenPayload?.userId ??
        tokenPayload?.id ??
        tokenPayload?.user_id ??
        tokenPayload?.employeeId ??
        (tokenPayload?.sub && !isNaN(Number(tokenPayload.sub)) ? tokenPayload.sub : null) ??
        null

      if (resolvedUserId != null) {
        localStorage.setItem('userId', String(resolvedUserId))
      }

      const userData: User = {
        ...(typeof data.user === 'object' && data.user ? data.user : {}),
        id: resolvedUserId,
        userId: resolvedUserId,
        username: data.user?.username || data.username || credentials.username,
        email: data.user?.email || data.email,
        roles: parsedRoles,
        ...(parsedRoles.length > 0 ? { role: parsedRoles[0] } : {}),
      }
      userData.roles = parsedRoles
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))

      return data
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          error.value =
            err.response.data?.message || 'Invalid username or password. Please try again.'
        } else {
          error.value =
            err.response.data?.message || `Server error (${err.response.status}).`
        }
      } else if (err.request) {
        error.value =
          'Unable to connect to http://localhost:8080. Please ensure the backend is running.'
      } else {
        error.value = err.message || 'An unexpected error occurred.'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    roles.value = []
    error.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    localStorage.removeItem('roles')
  }

  function clearError() {
    error.value = null
  }

  return {
    token,
    user,
    roles,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isEmployee,
    login,
    logout,
    clearError,
  }
})
