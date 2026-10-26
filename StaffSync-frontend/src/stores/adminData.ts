import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api'

export interface Department {
  id: string | number
  name: string
  code: string
  leadName: string
  leadEmail: string
  description: string
  color: 'indigo' | 'emerald' | 'violet' | 'teal' | 'amber' | 'rose' | 'sky'
  icon: string
  location: string
  budget: string
  createdAt: string
}

export interface AdminUser {
  id: string | number
  username: string
  password?: string
  fullName: string
  email: string
  jobTitle: string
  enabled: boolean
  department?: any
  role: 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | string
  systemRole?: 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | string
  roles?: string[]
  // UI helpers
  name: string
  departmentId: string | number
  status: 'Active' | 'On Shift' | 'On Leave' | 'Remote'
  avatarUrl?: string
  phone: string
  joinDate: string
}

export interface AdminTask {
  id: string | number
  title: string
  description: string
  status: 'Todo' | 'In Progress' | 'Completed'
  priority: 'Low' | 'Medium' | 'High'
  dueDate: string
  assignedTo: (string | number)[]
  // UI helpers
  userId: string | number
  departmentId: string | number
  category: string
  createdAt: string
}

export interface AdminActivityLog {
  id: string
  action: string
  target: string
  timestamp: string
  type: 'department' | 'user' | 'task' | 'system'
}

const colorPalette: Department['color'][] = [
  'indigo',
  'emerald',
  'violet',
  'teal',
  'amber',
  'rose',
  'sky',
]

export function getInitials(name?: string): string {
  if (!name) return '?'
  const clean = name.trim()
  if (!clean) return '?'
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts[0]?.[0] || ''
    const last = parts[parts.length - 1]?.[0] || ''
    return (first + last).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

const avatarColorStyles = [
  'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20',
  'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-500/20',
  'bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border-violet-500/20',
  'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border-teal-500/20',
  'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20',
  'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/20',
  'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/20',
]

export function getAvatarColor(key?: string | number): string {
  if (!key) return avatarColorStyles[0]!
  const s = String(key)
  let sum = 0
  for (let i = 0; i < s.length; i++) {
    sum += s.charCodeAt(i)
  }
  return avatarColorStyles[sum % avatarColorStyles.length] || avatarColorStyles[0]!
}

function normalizeStatus(raw: any): 'Todo' | 'In Progress' | 'Completed' {
  if (!raw) return 'Todo'
  const s = String(raw).toUpperCase().replace(/\s+/g, '_')
  if (s === 'IN_PROGRESS') return 'In Progress'
  if (s === 'COMPLETED' || s === 'DONE') return 'Completed'
  return 'Todo'
}

function toBackendStatus(status: string): string {
  const s = status.toUpperCase().replace(/\s+/g, '_')
  if (s.includes('PROGRESS')) return 'IN_PROGRESS'
  if (s.includes('COMPLET')) return 'COMPLETED'
  return 'TODO'
}

function normalizePriority(raw: any): 'Low' | 'Medium' | 'High' {
  if (!raw) return 'Medium'
  const p = String(raw).toUpperCase()
  if (p === 'LOW') return 'Low'
  if (p === 'HIGH' || p === 'URGENT') return 'High'
  return 'Medium'
}

function toBackendPriority(priority: string): string {
  const p = priority.toUpperCase()
  if (p === 'LOW') return 'LOW'
  if (p === 'HIGH' || p === 'URGENT') return 'HIGH'
  return 'MEDIUM'
}

function normalizeAssignedTo(raw: any): (string | number)[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((item) => (typeof item === 'object' && item?.id != null ? item.id : item))
  }
  if (typeof raw === 'object' && raw.id != null) {
    return [raw.id]
  }
  return [raw]
}

export const useAdminDataStore = defineStore('adminData', () => {
  const departments = ref<Department[]>([])
  const users = ref<AdminUser[]>([])
  const tasks = ref<AdminTask[]>([])
  const activityLogs = ref<AdminActivityLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Initialize activity logs from localStorage
  try {
    const savedLogs = localStorage.getItem('staffsync_activity_logs')
    if (savedLogs) {
      activityLogs.value = JSON.parse(savedLogs)
    }
  } catch {
    // ignore
  }

  function addLog(action: string, target: string, type: AdminActivityLog['type'] = 'system') {
    const newLog: AdminActivityLog = {
      id: 'log-' + Date.now(),
      action,
      target,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    }
    activityLogs.value.unshift(newLog)
    if (activityLogs.value.length > 50) {
      activityLogs.value.pop()
    }
    try {
      localStorage.setItem('staffsync_activity_logs', JSON.stringify(activityLogs.value))
    } catch {
      // ignore
    }
  }

  // --- Normalizers ---
  function mapDepartment(d: any, index: number = 0): Department {
    return {
      id: d.id,
      name: d.name || '',
      code: d.code || '',
      leadName: d.leadName || 'Department Lead',
      leadEmail: d.leadEmail || `${(d.code || 'dept').toLowerCase()}@staffsync.io`,
      description: d.description || `Core operations for ${d.name || d.code}.`,
      color: d.color || colorPalette[index % colorPalette.length] || 'indigo',
      icon: d.icon || 'code',
      location: d.location || 'Building A',
      budget: d.budget || '$200,000 / yr',
      createdAt: d.createdAt || '2026-01-01',
    }
  }

  function mapUser(u: any): AdminUser {
    const deptId =
      typeof u.department === 'object' && u.department != null
        ? u.department.id
        : u.department || ''

    let role = 'ROLE_EMPLOYEE'
    if (u.role === 'ROLE_ADMIN' || u.role === 'ADMIN') {
      role = 'ROLE_ADMIN'
    } else if (Array.isArray(u.roles) && u.roles.some((r: any) => (typeof r === 'string' ? r : r.name || r.role || r.authority) === 'ROLE_ADMIN')) {
      role = 'ROLE_ADMIN'
    } else if (Array.isArray(u.authorities) && u.authorities.some((a: any) => (typeof a === 'string' ? a : a.authority || a.role) === 'ROLE_ADMIN')) {
      role = 'ROLE_ADMIN'
    } else if (u.role === 'ROLE_EMPLOYEE' || u.role === 'EMPLOYEE') {
      role = 'ROLE_EMPLOYEE'
    }

    const jobTitle =
      u.jobTitle ||
      (u.role && u.role !== 'ROLE_ADMIN' && u.role !== 'ADMIN' && u.role !== 'ROLE_EMPLOYEE' && u.role !== 'EMPLOYEE'
        ? u.role
        : 'Team Member')

    return {
      id: u.id,
      username: u.username || '',
      fullName: u.fullName || u.name || u.username || 'User',
      email: u.email || '',
      jobTitle: jobTitle,
      enabled: u.enabled !== false,
      department: u.department,
      name: u.fullName || u.name || u.username || 'User',
      role: role,
      systemRole: role,
      departmentId: deptId,
      status: u.enabled !== false ? 'Active' : 'On Leave',
      avatarUrl: '',
      phone: u.phone || '+1 (555) 019-2831',
      joinDate: u.joinDate || '2026-01-15',
    }
  }

  function mapTask(t: any): AdminTask {
    const assignedIds = normalizeAssignedTo(t.assignedTo)
    const firstUserId = assignedIds[0] || ''
    const assignedUser = users.value.find((u) => String(u.id) === String(firstUserId))

    return {
      id: t.id,
      title: t.title || '',
      description: t.description || '',
      status: normalizeStatus(t.status),
      priority: normalizePriority(t.priority),
      dueDate: t.dueDate || '',
      assignedTo: assignedIds,
      userId: firstUserId,
      departmentId: assignedUser?.departmentId || '',
      category: t.category || 'General',
      createdAt: t.createdAt || '2026-02-01',
    }
  }

  // --- API Methods ---

  // Departments
  async function fetchDepartments() {
    try {
      const res = await apiClient.get('/departments')
      const rawList = Array.isArray(res.data) ? res.data : []
      departments.value = rawList.map((d: any, idx: number) => mapDepartment(d, idx))
      return departments.value
    } catch (err: any) {
      console.warn('Failed to fetch /departments:', err?.message || err)
      throw err
    }
  }

  async function addDepartment(data: { name: string; code: string }) {
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
    }
    const res = await apiClient.post('/departments', payload)
    const created = mapDepartment(res.data, departments.value.length)
    departments.value.unshift(created)
    addLog(`Created department ${created.name}`, `Assigned code ${created.code}`, 'department')
    return created
  }

  async function updateDepartment(id: string | number, data: { name: string; code: string }) {
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
    }
    const res = await apiClient.put(`/departments/${id}`, payload)
    const updated = mapDepartment(res.data || { id, ...payload }, 0)
    const index = departments.value.findIndex((d) => String(d.id) === String(id))
    if (index !== -1) {
      departments.value[index] = { ...departments.value[index], ...updated }
    }
    addLog(`Updated department ${updated.name}`, `Code: ${updated.code}`, 'department')
    return updated
  }

  async function deleteDepartment(id: string | number) {
    const targetDept = departments.value.find((d) => String(d.id) === String(id))
    await apiClient.delete(`/departments/${id}`)
    departments.value = departments.value.filter((d) => String(d.id) !== String(id))
    addLog(`Deleted department`, targetDept?.name || `ID ${id}`, 'department')
  }

  // Users
  async function fetchUsers() {
    try {
      const res = await apiClient.get('/users')
      const rawList = Array.isArray(res.data) ? res.data : []
      users.value = rawList.map((u: any) => mapUser(u))
      return users.value
    } catch (err: any) {
      console.warn('Failed to fetch /users:', err?.message || err)
      throw err
    }
  }

  async function addUser(data: {
    username: string
    password?: string
    fullName: string
    email: string
    jobTitle: string
    enabled: boolean
    department?: any
    role?: string
  }) {
    const deptId =
      typeof data.department === 'object' && data.department != null
        ? data.department.id
        : data.department
    const payload: any = {
      username: data.username.trim(),
      password: data.password || 'password123',
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      jobTitle: data.jobTitle.trim(),
      enabled: data.enabled !== false,
      department: deptId ? { id: Number(deptId) || deptId } : null,
      role: data.role || 'ROLE_EMPLOYEE',
    }

    const res = await apiClient.post('/users', payload)
    const created = mapUser(res.data)
    users.value.unshift(created)
    addLog(`Registered user ${created.name}`, `Role: ${created.role}`, 'user')
    return created
  }

  async function updateUser(
    id: string | number,
    data: {
      username: string
      password?: string
      fullName: string
      email: string
      jobTitle: string
      enabled: boolean
      department?: any
      role?: string
    },
  ) {
    const deptId =
      typeof data.department === 'object' && data.department != null
        ? data.department.id
        : data.department
    const payload: any = {
      username: data.username.trim(),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      jobTitle: data.jobTitle.trim(),
      enabled: data.enabled !== false,
      department: deptId ? { id: Number(deptId) || deptId } : null,
    }
    if (data.role) {
      payload.role = data.role
    }
    if (data.password && data.password.trim()) {
      payload.password = data.password.trim()
    }

    const res = await apiClient.put(`/users/${id}`, payload)
    const updated = mapUser(res.data || { id, ...payload })
    const index = users.value.findIndex((u) => String(u.id) === String(id))
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updated }
    }
    addLog(`Updated profile for ${updated.name}`, `Role: ${updated.role}`, 'user')
    return updated
  }

  async function deleteUser(id: string | number) {
    const target = users.value.find((u) => String(u.id) === String(id))
    await apiClient.delete(`/users/${id}`)
    users.value = users.value.filter((u) => String(u.id) !== String(id))
    addLog(`Removed team member`, target?.name || `ID ${id}`, 'user')
  }

  // Tasks
  async function fetchTasks() {
    try {
      const res = await apiClient.get('/tasks')
      const rawList = Array.isArray(res.data) ? res.data : []
      tasks.value = rawList.map((t: any) => mapTask(t))
      return tasks.value
    } catch (err: any) {
      console.warn('Failed to fetch /tasks:', err?.message || err)
      throw err
    }
  }

  async function addTask(data: {
    title: string
    description: string
    status: 'Todo' | 'In Progress' | 'Completed' | string
    priority: 'Low' | 'Medium' | 'High' | string
    dueDate: string
    assignedTo: (string | number)[]
  }) {
    const assignedIds = Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo]
    const payload: any = {
      title: data.title.trim(),
      description: data.description.trim(),
      status: toBackendStatus(data.status),
      priority: toBackendPriority(data.priority),
      dueDate: data.dueDate || null,
      assignedTo: assignedIds,
    }

    const res = await apiClient.post('/tasks', payload)
    const created = mapTask(res.data)
    tasks.value.unshift(created)
    addLog(`Assigned new task "${created.title}"`, `Priority: ${created.priority}`, 'task')
    return created
  }

  async function updateTask(
    id: string | number,
    data: {
      title: string
      description: string
      status: 'Todo' | 'In Progress' | 'Completed' | string
      priority: 'Low' | 'Medium' | 'High' | string
      dueDate: string
      assignedTo: (string | number)[]
    },
  ) {
    const assignedIds = Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo]
    const payload: any = {
      title: data.title.trim(),
      description: data.description.trim(),
      status: toBackendStatus(data.status),
      priority: toBackendPriority(data.priority),
      dueDate: data.dueDate || null,
      assignedTo: assignedIds,
    }

    const res = await apiClient.put(`/tasks/${id}`, payload)
    const updated = mapTask(res.data || { id, ...payload })
    const index = tasks.value.findIndex((t) => String(t.id) === String(id))
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updated }
    }
    addLog(`Updated task "${updated.title}"`, `Status: ${updated.status}`, 'task')
    return updated
  }

  async function updateTaskStatus(
    id: string | number,
    newStatus: 'Todo' | 'In Progress' | 'Completed',
  ) {
    const task = tasks.value.find((t) => String(t.id) === String(id))
    if (!task) return
    return updateTask(id, {
      title: task.title,
      description: task.description,
      status: newStatus,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
    })
  }

  async function deleteTask(id: string | number) {
    const target = tasks.value.find((t) => String(t.id) === String(id))
    await apiClient.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter((t) => String(t.id) !== String(id))
    addLog(`Deleted task`, target?.title || `ID ${id}`, 'task')
  }

  // Global Fetch
  async function fetchAll() {
    isLoading.value = true
    error.value = null

    try {
      await Promise.allSettled([fetchDepartments(), fetchUsers(), fetchTasks()])
    } catch (err: any) {
      error.value = 'Failed to synchronize data with backend server.'
    } finally {
      isLoading.value = false
    }
  }

  // --- Computed Stats & Lookups ---
  const totalDepartments = computed(() => departments.value.length)
  const totalUsers = computed(() => users.value.length)
  const totalTasks = computed(() => tasks.value.length)

  const completedTasksCount = computed(
    () => tasks.value.filter((t) => t.status === 'Completed').length,
  )
  const pendingTasksCount = computed(
    () => tasks.value.filter((t) => t.status !== 'Completed').length,
  )
  const completionRate = computed(() => {
    if (totalTasks.value === 0) return 100
    return Math.round((completedTasksCount.value / totalTasks.value) * 100)
  })

  function getDepartmentById(id: string | number): Department | undefined {
    return departments.value.find((d) => String(d.id) === String(id))
  }

  function getUserById(id: string | number): AdminUser | undefined {
    return users.value.find((u) => String(u.id) === String(id))
  }

  function getUsersByDepartment(deptId: string | number): AdminUser[] {
    return users.value.filter((u) => String(u.departmentId) === String(deptId))
  }

  function getTasksByUser(userId: string | number): AdminTask[] {
    return tasks.value.filter(
      (t) =>
        t.assignedTo.some((id) => String(id) === String(userId)) ||
        String(t.userId) === String(userId),
    )
  }

  function getTasksByDepartment(deptId: string | number): AdminTask[] {
    const deptUsers = getUsersByDepartment(deptId).map((u) => String(u.id))
    return tasks.value.filter((t) =>
      t.assignedTo.some((id) => deptUsers.includes(String(id))),
    )
  }

  return {
    departments,
    users,
    tasks,
    activityLogs,
    isLoading,
    error,
    totalDepartments,
    totalUsers,
    totalTasks,
    completedTasksCount,
    pendingTasksCount,
    completionRate,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    fetchTasks,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    fetchAll,
    getDepartmentById,
    getUserById,
    getUsersByDepartment,
    getTasksByUser,
    getTasksByDepartment,
    addLog,
  }
})
