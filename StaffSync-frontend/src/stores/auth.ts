import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api'

export interface User {
  id?: string | number
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

function getStoredUser(): User | null {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      return JSON.parse(savedUser)
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

      const userData: User = data.user || {
        username: credentials.username,
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
