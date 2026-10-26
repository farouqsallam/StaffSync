<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'

interface EmployeeTask {
  id: string | number
  title: string
  description: string
  status: 'Todo' | 'In Progress' | 'Completed'
  priority: 'Low' | 'Medium' | 'High'
  dueDate: string
  assignedTo: (string | number)[]
}

const router = useRouter()
const authStore = useAuthStore()

// State
const tasks = ref<EmployeeTask[]>([])
const isLoading = ref(false)
const notification = ref<string | null>(null)
const notificationType = ref<'success' | 'danger'>('success')

// Filters & Display
const searchQuery = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const viewMode = ref<'cards' | 'kanban'>('cards')

// Modals
const isTaskModalOpen = ref(false)
const taskToEdit = ref<EmployeeTask | null>(null)
const taskForm = ref({
  title: '',
  description: '',
  status: 'Todo' as 'Todo' | 'In Progress' | 'Completed',
  priority: 'Medium' as 'Low' | 'Medium' | 'High',
  dueDate: '',
})

const isDeleteModalOpen = ref(false)
const taskToDelete = ref<EmployeeTask | null>(null)

function showToast(msg: string, type: 'success' | 'danger' = 'success') {
  notification.value = msg
  notificationType.value = type
  setTimeout(() => {
    if (notification.value === msg) {
      notification.value = null
    }
  }, 4000)
}

// Normalizers
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

function mapTask(t: any): EmployeeTask {
  return {
    id: t.id,
    title: t.title || '',
    description: t.description || '',
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    dueDate: t.dueDate || '',
    assignedTo: normalizeAssignedTo(t.assignedTo),
  }
}

// Resolve employee id from store or JWT token (never calls /users as employee cannot access it)
function getEmployeeId(): string | number | null {
  if (authStore.user?.userId != null && authStore.user.userId !== '') {
    return authStore.user.userId
  }
  if (authStore.user?.id != null && authStore.user.id !== '') {
    return authStore.user.id
  }

  const storedUserId = localStorage.getItem('userId')
  if (storedUserId) {
    return storedUserId
  }

  // Fallback: check stored JWT token claims directly
  const token = authStore.token || localStorage.getItem('token') || localStorage.getItem('access_token')
  if (token) {
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
        const payload = JSON.parse(jsonPayload)
        const extracted =
          payload.userId ??
          payload.id ??
          payload.user_id ??
          payload.employeeId ??
          (payload.sub && !isNaN(Number(payload.sub)) ? payload.sub : null)
        if (extracted != null && extracted !== '') {
          if (authStore.user) {
            authStore.user.userId = extracted
            authStore.user.id = extracted
            localStorage.setItem('user', JSON.stringify(authStore.user))
          }
          return extracted
        }
      }
    } catch {
      // ignore
    }
  }

  return null
}

// API - Fetch employee tasks from /users/${userID}/tasks
async function fetchMyTasks() {
  isLoading.value = true
  try {
    const employeeId = getEmployeeId()
    if (!employeeId) {
      console.warn('Could not determine employee ID for /users/{userID}/tasks')
      showToast('Could not find employee ID. Please try logging in again.', 'danger')
      tasks.value = []
      return
    }

    const res = await apiClient.get(`/users/${employeeId}/tasks`)
    const rawList = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.tasks)
        ? res.data.tasks
        : Array.isArray(res.data?.data)
          ? res.data.data
          : []

    tasks.value = rawList.map((t: any) => mapTask(t))
  } catch (err: any) {
    console.error('Failed to fetch employee tasks from /users/{userID}/tasks:', err)
    showToast('Failed to load your tasks from server.', 'danger')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMyTasks()
})

// Filtered tasks for UI
const myFilteredTasks = computed(() => {
  let list = tasks.value

  if (statusFilter.value !== 'All') {
    list = list.filter((t) => t.status === statusFilter.value)
  }

  if (priorityFilter.value !== 'All') {
    list = list.filter((t) => t.priority === priorityFilter.value)
  }

  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    )
  }

  return list
})

// Metrics
const totalTasksCount = computed(() => tasks.value.length)
const todoTasksCount = computed(() => tasks.value.filter((t) => t.status === 'Todo').length)
const inProgressTasksCount = computed(() => tasks.value.filter((t) => t.status === 'In Progress').length)
const completedTasksCount = computed(() => tasks.value.filter((t) => t.status === 'Completed').length)

// Task CRUD
function openCreateModal() {
  taskToEdit.value = null
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 5)
  taskForm.value = {
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: defaultDate.toISOString().split('T')[0] ?? '',
  }
  isTaskModalOpen.value = true
}

function openEditModal(task: EmployeeTask) {
  taskToEdit.value = task
  taskForm.value = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate || '',
  }
  isTaskModalOpen.value = true
}

async function handleSaveTask() {
  if (!taskForm.value.title.trim()) return

  const employeeId = getEmployeeId()
  const currentUserId = employeeId || authStore.user?.id || authStore.user?.username || '1'
  const payload: any = {
    title: taskForm.value.title.trim(),
    description: taskForm.value.description.trim(),
    status: toBackendStatus(taskForm.value.status),
    priority: toBackendPriority(taskForm.value.priority),
    dueDate: taskForm.value.dueDate || null,
    assignedTo: taskToEdit.value ? taskToEdit.value.assignedTo : [currentUserId],
  }

  try {
    if (taskToEdit.value) {
      const res = await apiClient.put(`/tasks/${taskToEdit.value.id}`, payload)
      const updated = mapTask(res.data || { id: taskToEdit.value.id, ...payload })
      const idx = tasks.value.findIndex((t) => String(t.id) === String(taskToEdit.value!.id))
      if (idx !== -1) tasks.value[idx] = updated
      showToast('Task updated successfully!')
    } else {
      const res = await apiClient.post('/tasks', payload)
      const created = mapTask(res.data || payload)
      tasks.value.unshift(created)
      showToast('Task created and added to your roster!')
    }
    isTaskModalOpen.value = false
    taskToEdit.value = null
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to save task.', 'danger')
  }
}

async function handleStatusChange(task: EmployeeTask, newStatus: 'Todo' | 'In Progress' | 'Completed') {
  try {
    const payload = {
      title: task.title,
      description: task.description,
      status: toBackendStatus(newStatus),
      priority: toBackendPriority(task.priority),
      dueDate: task.dueDate || null,
      assignedTo: task.assignedTo,
    }
    await apiClient.put(`/tasks/${task.id}`, payload)
    task.status = newStatus
    showToast(`Status changed to ${newStatus}!`)
  } catch (err: any) {
    showToast('Failed to update task status.', 'danger')
  }
}

function promptDelete(task: EmployeeTask) {
  taskToDelete.value = task
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (!taskToDelete.value) return
  const id = taskToDelete.value.id
  try {
    await apiClient.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter((t) => String(t.id) !== String(id))
    showToast('Task deleted successfully!')
  } catch (err: any) {
    showToast('Failed to delete task.', 'danger')
  } finally {
    isDeleteModalOpen.value = false
    taskToDelete.value = null
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

function getPriorityBadgeClass(priority: EmployeeTask['priority']) {
  switch (priority) {
    case 'High':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
    case 'Medium':
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20'
    case 'Low':
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
  }
}

function getStatusBadgeClass(status: EmployeeTask['status']) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
    case 'In Progress':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
    case 'Todo':
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30'
  }
}
</script>

<template>
  <div class="flex-1 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-6 lg:p-8">
    <!-- Notification Toast -->
    <div
      v-if="notification"
      class="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto max-w-md z-50 flex items-center justify-between sm:justify-start gap-3 py-3 px-4 sm:px-5 rounded-2xl shadow-2xl border text-xs sm:text-sm font-medium animate-fade-in"
      :class="notificationType === 'success' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700/50' : 'bg-rose-900 text-white border-rose-700'"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-2.5 h-2.5 rounded-full shrink-0" :class="notificationType === 'success' ? 'bg-teal-400 animate-pulse' : 'bg-rose-400'"></div>
        <span class="truncate">{{ notification }}</span>
      </div>
      <button
        type="button"
        class="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900 text-lg leading-none shrink-0"
        @click="notification = null"
      >
        &times;
      </button>
    </div>

    <!-- Workspace Container -->
    <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <!-- Top Bar: Greeting & Employee Identity -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Employee Tasks Workspace
            </h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 shadow-2xs shrink-0">
              <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              API Connected
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong class="text-slate-800 dark:text-slate-200">{{ authStore.user?.username || 'Employee' }}</strong>
            with authority
            <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              ROLE_EMPLOYEE
            </span>
          </p>
        </div>

        <div class="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-teal-600/20 transition active:scale-95"
            @click="openCreateModal"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Task</span>
          </button>

          <button
            type="button"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs sm:text-sm font-semibold transition"
            @click="handleLogout"
            title="Log out from employee session"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span class="hidden xs:inline">Logout</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <!-- Metric 1: My Total Tasks -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Deliverables</span>
            <div class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
          </div>
          <div class="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ totalTasksCount }}</span>
            <span class="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Total</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2.5 sm:mt-3">
            <div
              class="bg-teal-500 h-full rounded-full transition-all duration-500"
              :style="{ width: totalTasksCount > 0 ? `${(completedTasksCount / totalTasksCount) * 100}%` : '0%' }"
            ></div>
          </div>
        </div>

        <!-- Metric 2: Todo Tasks -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Pending</span>
            <div class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
          </div>
          <div class="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ todoTasksCount }}</span>
            <span class="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400">Todo</span>
          </div>
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-none">Ready to start</p>
        </div>

        <!-- Metric 3: In Progress -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">In Progress</span>
            <div class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <div class="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ inProgressTasksCount }}</span>
            <span class="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400">Underway</span>
          </div>
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-none">Being executed</p>
        </div>

        <!-- Metric 4: Completed -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Finished</span>
            <div class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div class="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ completedTasksCount }}</span>
            <span class="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">Done</span>
          </div>
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-none">Delivered</p>
        </div>
      </div>

      <!-- Tasks Workspace Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div class="relative flex-1 w-full">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search my tasks by title or details..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-teal-500"
          />
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 flex-wrap xs:flex-nowrap">
          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-teal-500"
          >
            <option value="All">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <!-- Priority Filter -->
          <select
            v-model="priorityFilter"
            class="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-teal-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <!-- View Mode Toggle -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              type="button"
              class="p-1.5 rounded-lg text-xs font-medium transition"
              :class="viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'"
              @click="viewMode = 'cards'"
              title="Cards View"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              class="p-1.5 rounded-lg text-xs font-medium transition"
              :class="viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'"
              @click="viewMode = 'kanban'"
              title="Kanban View"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="5" height="18" rx="1" />
                <rect x="10" y="3" width="5" height="12" rx="1" />
                <rect x="17" y="3" width="5" height="15" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="myFilteredTasks.length === 0"
        class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center"
      >
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 shrink-0">
          <svg class="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          No Tasks Found
        </h3>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          {{ searchQuery ? `No tasks found matching "${searchQuery}".` : 'You do not have any tasks matching your filters. Create a new task to get started.' }}
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md transition"
          @click="openCreateModal"
        >
          + Add New Task
        </button>
      </div>

      <!-- Cards View -->
      <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div
          v-for="task in myFilteredTasks"
          :key="task.id"
          class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-3 mb-2.5">
              <span class="px-2 py-0.5 rounded-lg text-xs font-semibold" :class="getPriorityBadgeClass(task.priority)">
                {{ task.priority }} Priority
              </span>

              <!-- Actions -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Edit Task"
                  @click="openEditModal(task)"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Delete Task"
                  @click="promptDelete(task)"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>

            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              {{ task.title }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {{ task.description || 'No description provided.' }}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-1.5 text-slate-400">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{{ task.dueDate ? `Due ${task.dueDate}` : 'No deadline' }}</span>
            </div>

            <select
              :value="task.status"
              class="px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer outline-none transition"
              :class="getStatusBadgeClass(task.status)"
              @change="handleStatusChange(task, ($event.target as HTMLSelectElement).value as any)"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Kanban View -->
      <div v-else-if="viewMode === 'kanban'" class="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-3.5 sm:gap-5 pb-2 md:pb-0 scrollbar-thin">
        <div
          v-for="col in ['Todo', 'In Progress', 'Completed'] as const"
          :key="col"
          class="min-w-[270px] xs:min-w-[300px] flex-1 md:min-w-0 bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/60 dark:border-slate-800/60 flex flex-col min-h-[380px]"
        >
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {{ col }}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
              {{ myFilteredTasks.filter(t => t.status === col).length }}
            </span>
          </div>

          <div class="space-y-3 flex-1 overflow-y-auto">
            <div
              v-for="task in myFilteredTasks.filter(t => t.status === col)"
              :key="task.id"
              class="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition"
            >
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="getPriorityBadgeClass(task.priority)">
                  {{ task.priority }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">{{ task.dueDate || 'No date' }}</span>
              </div>

              <h5 class="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {{ task.title }}
              </h5>
              <p class="text-[11px] text-slate-500 line-clamp-2 mt-1">
                {{ task.description }}
              </p>

              <div class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <select
                  :value="task.status"
                  class="px-2 py-0.5 rounded text-[10px] font-semibold outline-none cursor-pointer"
                  :class="getStatusBadgeClass(task.status)"
                  @change="handleStatusChange(task, ($event.target as HTMLSelectElement).value as any)"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="p-1 text-slate-400 hover:text-teal-500"
                    title="Edit"
                    @click="openEditModal(task)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-1 text-slate-400 hover:text-rose-500"
                    title="Delete"
                    @click="promptDelete(task)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="myFilteredTasks.filter(t => t.status === col).length === 0"
              class="py-8 text-center text-slate-400 text-xs italic"
            >
              No tasks in this lane
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit Task -->
    <div
      v-if="isTaskModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      @click.self="isTaskModalOpen = false"
    >
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {{ taskToEdit ? 'Edit My Task' : 'Create New Task' }}
          </h2>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
            @click="isTaskModalOpen = false"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="handleSaveTask" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              v-model="taskForm.title"
              required
              type="text"
              placeholder="e.g. Update user documentation"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              placeholder="Task details and milestones..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                v-model="taskForm.priority"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                v-model="taskForm.status"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div class="xs:col-span-2 sm:col-span-1">
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                v-model="taskForm.dueDate"
                type="date"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div class="pt-4 flex flex-col-reverse xs:flex-row items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              class="w-full xs:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              @click="isTaskModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="w-full xs:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition active:scale-95"
            >
              {{ taskToEdit ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Confirm Delete Task -->
    <div
      v-if="isDeleteModalOpen && taskToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      @click.self="isDeleteModalOpen = false"
    >
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-start gap-3.5 sm:gap-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Delete Task?</h3>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Are you sure you want to delete "<strong>{{ taskToDelete.title }}</strong>"? This action cannot be undone.
            </p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse xs:flex-row items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            class="w-full xs:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            @click="isDeleteModalOpen = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="w-full xs:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white shadow-md shadow-rose-600/25 transition active:scale-95 flex items-center justify-center gap-1.5"
            @click="confirmDelete"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete Task</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
