<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  useAdminDataStore,
  type Department,
  type AdminUser,
  type AdminTask,
} from '@/stores/adminData'

import AdminStatsBar from './admin/AdminStatsBar.vue'
import DepartmentSection from './admin/DepartmentSection.vue'
import DepartmentUsersSection from './admin/DepartmentUsersSection.vue'
import UserTasksSection from './admin/UserTasksSection.vue'
import GlobalUsersSection from './admin/GlobalUsersSection.vue'
import GlobalTasksSection from './admin/GlobalTasksSection.vue'
import AuditLogSection from './admin/AuditLogSection.vue'
import DepartmentModal from './admin/DepartmentModal.vue'
import UserModal from './admin/UserModal.vue'
import TaskModal from './admin/TaskModal.vue'
import DeleteConfirmModal from './admin/DeleteConfirmModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminDataStore()

onMounted(async () => {
  await adminStore.fetchAll()
})

// Navigation & View States
type ViewTab = 'hierarchy' | 'all-users' | 'all-tasks' | 'audit-log'
const activeTab = ref<ViewTab>('hierarchy')

type HierarchyLevel = 'departments' | 'users' | 'tasks'
const currentLevel = ref<HierarchyLevel>('departments')
const selectedDepartmentId = ref<string | number | null>(null)
const selectedUserId = ref<string | number | null>(null)

// Toast Notifications
const toastMessage = ref<string | null>(null)
const toastType = ref<'success' | 'info' | 'danger'>('success')

function showToast(message: string, type: 'success' | 'info' | 'danger' = 'success') {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    if (toastMessage.value === message) {
      toastMessage.value = null
    }
  }, 4000)
}

// Modals State
const isDeptModalOpen = ref(false)
const deptToEdit = ref<Department | null>(null)

const isUserModalOpen = ref(false)
const userToEdit = ref<AdminUser | null>(null)

const isTaskModalOpen = ref(false)
const taskToEdit = ref<AdminTask | null>(null)

const isDeleteModalOpen = ref(false)
const deleteMeta = ref<{
  id: string | number
  type: 'department' | 'user' | 'task'
  title: string
  message: string
} | null>(null)

// Active selections
const activeDepartment = computed(() => {
  if (!selectedDepartmentId.value) return null
  return adminStore.getDepartmentById(selectedDepartmentId.value) || null
})

const activeUser = computed(() => {
  if (!selectedUserId.value) return null
  return adminStore.getUserById(selectedUserId.value) || null
})

// Drill-Down Handlers
function goToDepartments() {
  currentLevel.value = 'departments'
  selectedDepartmentId.value = null
  selectedUserId.value = null
}

function drillDownToDepartment(deptId: string | number) {
  selectedDepartmentId.value = deptId
  selectedUserId.value = null
  currentLevel.value = 'users'
}

function drillDownToUser(userId: string | number) {
  selectedUserId.value = userId
  currentLevel.value = 'tasks'
}

function goBackOneLevel() {
  if (currentLevel.value === 'tasks') {
    currentLevel.value = 'users'
    selectedUserId.value = null
  } else if (currentLevel.value === 'users') {
    currentLevel.value = 'departments'
    selectedDepartmentId.value = null
  }
}

function viewUserTasksFromGlobal(user: AdminUser) {
  activeTab.value = 'hierarchy'
  if (user.departmentId) {
    selectedDepartmentId.value = user.departmentId
  }
  selectedUserId.value = user.id
  currentLevel.value = 'tasks'
}

function viewDepartmentFromGlobal(deptId: string | number) {
  activeTab.value = 'hierarchy'
  drillDownToDepartment(deptId)
}

// Department CRUD
function openAddDepartmentModal() {
  deptToEdit.value = null
  isDeptModalOpen.value = true
}

function openEditDepartmentModal(dept: Department) {
  deptToEdit.value = dept
  isDeptModalOpen.value = true
}

async function handleSaveDepartment(data: { name: string; code: string }) {
  try {
    if (deptToEdit.value) {
      await adminStore.updateDepartment(deptToEdit.value.id, data)
      showToast(`Department "${data.name}" updated successfully.`)
    } else {
      const created = await adminStore.addDepartment(data)
      showToast(`Department "${created.name}" created successfully.`)
    }
    isDeptModalOpen.value = false
    deptToEdit.value = null
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to save department.', 'danger')
  }
}

function promptDeleteDepartment(dept: Department) {
  const userCount = adminStore.getUsersByDepartment(dept.id).length
  deleteMeta.value = {
    id: dept.id,
    type: 'department',
    title: `Delete Department: ${dept.name}?`,
    message: `Are you sure you want to permanently delete "${dept.name}" (${dept.code})? It currently contains ${userCount} team members.`,
  }
  isDeleteModalOpen.value = true
}

// User CRUD
function openAddUserModal(deptId?: string | number) {
  userToEdit.value = null
  if (deptId) {
    selectedDepartmentId.value = deptId
  }
  isUserModalOpen.value = true
}

function openEditUserModal(user: AdminUser) {
  userToEdit.value = user
  isUserModalOpen.value = true
}

async function handleSaveUser(data: {
  username: string
  password?: string
  fullName: string
  email: string
  jobTitle: string
  enabled: boolean
  department?: any
}) {
  try {
    if (userToEdit.value) {
      await adminStore.updateUser(userToEdit.value.id, data)
      showToast(`Updated user profile for ${data.fullName}.`)
    } else {
      const created = await adminStore.addUser(data)
      showToast(`Registered user ${created.name} successfully.`)
    }
    isUserModalOpen.value = false
    userToEdit.value = null
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to save user.', 'danger')
  }
}

function promptDeleteUser(user: AdminUser) {
  const taskCount = adminStore.getTasksByUser(user.id).length
  deleteMeta.value = {
    id: user.id,
    type: 'user',
    title: `Remove Member: ${user.name}?`,
    message: `Are you sure you want to remove ${user.name}? They have ${taskCount} assigned tasks that may be affected.`,
  }
  isDeleteModalOpen.value = true
}

// Task CRUD
function openAddTaskModal(userId?: string | number, deptId?: string | number) {
  taskToEdit.value = null
  if (userId) selectedUserId.value = userId
  if (deptId) selectedDepartmentId.value = deptId
  isTaskModalOpen.value = true
}

function openEditTaskModal(task: AdminTask) {
  taskToEdit.value = task
  isTaskModalOpen.value = true
}

async function handleSaveTask(data: {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  assignedTo: (string | number)[]
}) {
  try {
    if (taskToEdit.value) {
      await adminStore.updateTask(taskToEdit.value.id, data)
      showToast(`Task "${data.title}" updated successfully.`)
    } else {
      const created = await adminStore.addTask(data)
      showToast(`Assigned task "${created.title}" successfully.`)
    }
    isTaskModalOpen.value = false
    taskToEdit.value = null
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to save task.', 'danger')
  }
}

async function handleTaskStatusChange(task: AdminTask, newStatus: 'Todo' | 'In Progress' | 'Completed') {
  try {
    await adminStore.updateTaskStatus(task.id, newStatus)
    showToast(`Task status updated to ${newStatus}.`)
  } catch (err: any) {
    showToast('Failed to update task status.', 'danger')
  }
}

function promptDeleteTask(task: AdminTask) {
  deleteMeta.value = {
    id: task.id,
    type: 'task',
    title: `Delete Task: ${task.title}?`,
    message: `Are you sure you want to delete this task? This action cannot be undone.`,
  }
  isDeleteModalOpen.value = true
}

// Confirm Delete Dialog
async function handleConfirmDelete() {
  if (!deleteMeta.value) return
  const { id, type } = deleteMeta.value

  try {
    if (type === 'department') {
      await adminStore.deleteDepartment(id)
      if (selectedDepartmentId.value === id) {
        goToDepartments()
      }
      showToast('Department deleted successfully.')
    } else if (type === 'user') {
      await adminStore.deleteUser(id)
      if (selectedUserId.value === id) {
        if (selectedDepartmentId.value) {
          drillDownToDepartment(selectedDepartmentId.value)
        } else {
          goToDepartments()
        }
      }
      showToast('User deleted successfully.')
    } else if (type === 'task') {
      await adminStore.deleteTask(id)
      showToast('Task deleted successfully.')
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || `Failed to delete ${type}.`, 'danger')
  } finally {
    isDeleteModalOpen.value = false
    deleteMeta.value = null
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="flex-1 min-h-[calc(100vh-4.5rem)] bg-slate-50/70 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
    <!-- Floating Notification Toast -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 py-3 px-5 rounded-2xl shadow-2xl border text-sm font-medium backdrop-blur-md"
        :class="{
          'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700/50': toastType === 'success',
          'bg-rose-900 text-white dark:bg-rose-100 dark:text-rose-900 border-rose-700': toastType === 'danger',
          'bg-indigo-900 text-white dark:bg-indigo-100 dark:text-indigo-900 border-indigo-700': toastType === 'info',
        }"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{{ toastMessage }}</span>
        <button
          type="button"
          class="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900 text-lg leading-none"
          @click="toastMessage = null"
        >
          &times;
        </button>
      </div>
    </transition>

    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Top Administrative Action Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Admin Management Hub
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Organizational Hierarchy &bull;
                <strong class="text-slate-800 dark:text-slate-200">Departments</strong> &rarr;
                <strong class="text-slate-800 dark:text-slate-200">Personnel</strong> &rarr;
                <strong class="text-slate-800 dark:text-slate-200">Tasks</strong>
              </p>
            </div>
          </div>
        </div>

        <!-- Top Right Actions -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Primary Context-Aware Add Button -->
          <button
            v-if="currentLevel === 'departments' && activeTab === 'hierarchy'"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
            @click="openAddDepartmentModal"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Department
          </button>

          <button
            v-else-if="currentLevel === 'users' && activeTab === 'hierarchy'"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95"
            @click="openAddUserModal(selectedDepartmentId || undefined)"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Team Member
          </button>

          <button
            v-else-if="currentLevel === 'tasks' && activeTab === 'hierarchy'"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-600/20 transition active:scale-95"
            @click="openAddTaskModal(selectedUserId || undefined, selectedDepartmentId || undefined)"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Assign New Task
          </button>

          <!-- Logout Button -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs sm:text-sm font-semibold transition"
            @click="handleLogout"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <!-- Navigation Tabs Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
            :class="
              activeTab === 'hierarchy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            "
            @click="activeTab = 'hierarchy'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Hierarchy Navigator
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
            :class="
              activeTab === 'all-users'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            "
            @click="activeTab = 'all-users'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Personnel Directory ({{ adminStore.totalUsers }})
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
            :class="
              activeTab === 'all-tasks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            "
            @click="activeTab = 'all-tasks'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Global Tasks ({{ adminStore.totalTasks }})
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
            :class="
              activeTab === 'audit-log'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            "
            @click="activeTab = 'audit-log'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Audit Log ({{ adminStore.activityLogs.length }})
          </button>
        </div>

        <div class="text-xs font-mono text-slate-400 hidden lg:block px-2">
          ROLE_ADMIN &bull; API Connected
        </div>
      </div>

      <!-- KPI Summary Cards Banner (Shown on Level 1) -->
      <AdminStatsBar v-if="activeTab === 'hierarchy' && currentLevel === 'departments'" />

      <!-- Breadcrumbs Trail (Hierarchy Navigation) -->
      <div
        v-if="activeTab === 'hierarchy'"
        class="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
      >
        <div class="flex items-center gap-2 text-xs sm:text-sm font-medium overflow-x-auto py-1">
          <!-- Level 1: All Departments -->
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition"
            :class="
              currentLevel === 'departments'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
            "
            @click="goToDepartments"
          >
            <span>🏢</span>
            <span>All Departments</span>
            <span class="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded-full font-mono">
              {{ adminStore.totalDepartments }}
            </span>
          </button>

          <!-- Level 2: Department -->
          <template v-if="activeDepartment && (currentLevel === 'users' || currentLevel === 'tasks')">
            <span class="text-slate-400">&rsaquo;</span>
            <button
              type="button"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition"
              :class="
                currentLevel === 'users'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              "
              @click="drillDownToDepartment(activeDepartment.id)"
            >
              <span>📂</span>
              <span>{{ activeDepartment.name }}</span>
              <span class="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-mono">
                {{ adminStore.getUsersByDepartment(activeDepartment.id).length }} members
              </span>
            </button>
          </template>

          <!-- Level 3: User -->
          <template v-if="activeUser && currentLevel === 'tasks'">
            <span class="text-slate-400">&rsaquo;</span>
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
              <img :src="activeUser.avatarUrl" alt="" class="w-4 h-4 rounded-full object-cover" />
              <span>{{ activeUser.name }}</span>
              <span class="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full font-mono">
                {{ adminStore.getTasksByUser(activeUser.id).length }} tasks
              </span>
            </div>
          </template>
        </div>

        <div v-if="currentLevel !== 'departments'" class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            @click="goBackOneLevel"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {{ currentLevel === 'tasks' ? `Back to ${activeDepartment?.code || 'Department'}` : 'Back to Departments' }}
          </button>
        </div>
      </div>

      <!-- TAB 1: HIERARCHY NAVIGATOR -->
      <div v-if="activeTab === 'hierarchy'">
        <!-- Sub-Level 1: Departments -->
        <DepartmentSection
          v-if="currentLevel === 'departments'"
          @drill-down="drillDownToDepartment"
          @add="openAddDepartmentModal"
          @edit="openEditDepartmentModal"
          @delete="promptDeleteDepartment"
        />

        <!-- Sub-Level 2: Users in Department -->
        <DepartmentUsersSection
          v-else-if="currentLevel === 'users' && activeDepartment"
          :department="activeDepartment"
          @drill-user="drillDownToUser"
          @add-user="openAddUserModal(activeDepartment.id)"
          @edit-user="openEditUserModal"
          @delete-user="promptDeleteUser"
          @back="goToDepartments"
        />

        <!-- Sub-Level 3: User's Tasks -->
        <UserTasksSection
          v-else-if="currentLevel === 'tasks' && activeUser && activeDepartment"
          :user="activeUser"
          :department="activeDepartment"
          @assign-task="openAddTaskModal(activeUser.id, activeDepartment.id)"
          @edit-task="openEditTaskModal"
          @delete-task="promptDeleteTask"
          @status-change="handleTaskStatusChange"
          @edit-user="openEditUserModal"
          @back="drillDownToDepartment(activeDepartment.id)"
        />
      </div>

      <!-- TAB 2: GLOBAL PERSONNEL DIRECTORY -->
      <GlobalUsersSection
        v-else-if="activeTab === 'all-users'"
        @add-user="openAddUserModal()"
        @edit-user="openEditUserModal"
        @delete-user="promptDeleteUser"
        @view-user-tasks="viewUserTasksFromGlobal"
        @view-department="viewDepartmentFromGlobal"
      />

      <!-- TAB 3: GLOBAL TASKS BOARD -->
      <GlobalTasksSection
        v-else-if="activeTab === 'all-tasks'"
        @add-task="openAddTaskModal()"
        @edit-task="openEditTaskModal"
        @delete-task="promptDeleteTask"
        @status-change="handleTaskStatusChange"
      />

      <!-- TAB 4: AUDIT TRAIL LOG -->
      <AuditLogSection v-else-if="activeTab === 'audit-log'" />
    </div>

    <!-- Modals -->
    <DepartmentModal
      :is-open="isDeptModalOpen"
      :department-to-edit="deptToEdit"
      @close="isDeptModalOpen = false"
      @save="handleSaveDepartment"
    />

    <UserModal
      :is-open="isUserModalOpen"
      :user-to-edit="userToEdit"
      :default-department-id="selectedDepartmentId || undefined"
      @close="isUserModalOpen = false"
      @save="handleSaveUser"
    />

    <TaskModal
      :is-open="isTaskModalOpen"
      :task-to-edit="taskToEdit"
      :default-user-id="selectedUserId || undefined"
      :default-department-id="selectedDepartmentId || undefined"
      @close="isTaskModalOpen = false"
      @save="handleSaveTask"
    />

    <DeleteConfirmModal
      v-if="deleteMeta"
      :is-open="isDeleteModalOpen"
      :title="deleteMeta.title"
      :message="deleteMeta.message"
      :item-type="deleteMeta.type"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
