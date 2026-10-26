<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAdminDataStore, type AdminUser } from '@/stores/adminData'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  isOpen: boolean
  userToEdit: AdminUser | null
  defaultDepartmentId?: string | number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: {
      username: string
      password?: string
      fullName: string
      email: string
      jobTitle: string
      enabled: boolean
      department?: any
      role?: 'ROLE_EMPLOYEE' | 'ROLE_ADMIN' | string
    },
  ): void
}>()

const adminStore = useAdminDataStore()
const authStore = useAuthStore()

const form = ref<{
  username: string
  password: string
  fullName: string
  email: string
  jobTitle: string
  enabled: boolean
  departmentId: string | number
  role: 'ROLE_EMPLOYEE' | 'ROLE_ADMIN'
}>({
  username: '',
  password: '',
  fullName: '',
  email: '',
  jobTitle: '',
  enabled: true,
  departmentId: '',
  role: 'ROLE_EMPLOYEE',
})

function getInitialRole(user: any): 'ROLE_EMPLOYEE' | 'ROLE_ADMIN' {
  if (!user) return 'ROLE_EMPLOYEE'
  if (user.role === 'ROLE_ADMIN' || user.systemRole === 'ROLE_ADMIN' || user.role === 'ADMIN') return 'ROLE_ADMIN'
  if (Array.isArray(user.roles) && user.roles.some((r: any) => (typeof r === 'string' ? r : r.name || r.role || r.authority) === 'ROLE_ADMIN')) {
    return 'ROLE_ADMIN'
  }
  if (Array.isArray(user.authorities) && user.authorities.some((a: any) => (typeof a === 'string' ? a : a.authority || a.role) === 'ROLE_ADMIN')) {
    return 'ROLE_ADMIN'
  }
  return 'ROLE_EMPLOYEE'
}

watch(
  () => [props.userToEdit, props.defaultDepartmentId, props.isOpen],
  () => {
    if (props.userToEdit) {
      form.value = {
        username: props.userToEdit.username || '',
        password: '',
        fullName: props.userToEdit.fullName || props.userToEdit.name || '',
        email: props.userToEdit.email || '',
        jobTitle: props.userToEdit.jobTitle || (props.userToEdit.role !== 'ROLE_ADMIN' && props.userToEdit.role !== 'ROLE_EMPLOYEE' ? props.userToEdit.role : '') || '',
        enabled: props.userToEdit.enabled !== false,
        departmentId: props.userToEdit.departmentId || adminStore.departments[0]?.id || '',
        role: getInitialRole(props.userToEdit),
      }
    } else {
      const firstDeptId = props.defaultDepartmentId || adminStore.departments[0]?.id || ''
      form.value = {
        username: '',
        password: '',
        fullName: '',
        email: '',
        jobTitle: '',
        enabled: true,
        departmentId: firstDeptId,
        role: 'ROLE_EMPLOYEE',
      }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!form.value.username.trim() || !form.value.fullName.trim() || !form.value.email.trim()) return

  const payload: any = {
    username: form.value.username.trim(),
    fullName: form.value.fullName.trim(),
    email: form.value.email.trim(),
    jobTitle: form.value.jobTitle.trim() || 'Team Member',
    enabled: form.value.enabled,
    department: form.value.departmentId || null,
  }

  // Role key in payload (ROLE_EMPLOYEE / ROLE_ADMIN) - accessible by admins only
  if (authStore.isAdmin) {
    payload.role = form.value.role
  } else if (!props.userToEdit) {
    payload.role = 'ROLE_EMPLOYEE'
  }

  if (!props.userToEdit || form.value.password.trim()) {
    payload.password = form.value.password.trim() || 'password123'
  }

  emit('save', payload)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-thin"
    >
      <!-- Header -->
      <div class="flex items-start xs:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {{ userToEdit ? 'Edit Personnel' : 'Add New Team Member' }}
            </h2>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ userToEdit ? 'Update account credentials & assignment' : 'Register a new member to the roster' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          @click="emit('close')"
        >
          &times;
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
        <!-- Full Name & Username -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Full Name *
            </label>
            <input
              v-model="form.fullName"
              required
              type="text"
              placeholder="e.g. Alex Mercer"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Username *
            </label>
            <input
              v-model="form.username"
              required
              type="text"
              placeholder="e.g. alex_mercer"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <!-- Email & Password -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Work Email *
            </label>
            <input
              v-model="form.email"
              required
              type="email"
              placeholder="e.g. alex.m@staffsync.io"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {{ userToEdit ? 'New Password (Optional)' : 'Password *' }}
            </label>
            <input
              v-model="form.password"
              :required="!userToEdit"
              type="password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <!-- Job Title & Department -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Job Title / Designation *
            </label>
            <input
              v-model="form.jobTitle"
              required
              type="text"
              placeholder="e.g. Senior DevOps Specialist"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Department
            </label>
            <select
              v-model="form.departmentId"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">No Department Assigned</option>
              <option
                v-for="dept in adminStore.departments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }} ({{ dept.code }})
              </option>
            </select>
          </div>
        </div>

        <!-- System Role Selection / Toggle (Accessible by Admins only) -->
        <div
          v-if="authStore.isAdmin"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3"
        >
          <div class="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 dark:text-white">Role & Permissions</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  ADMIN ONLY
                </span>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">Toggle authority level between Employee and Administrator</div>
            </div>

            <!-- Segmented Quick Toggle -->
            <div class="inline-flex self-start xs:self-auto p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-700 shrink-0">
              <button
                type="button"
                @click="form.role = 'ROLE_EMPLOYEE'"
                class="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
                :class="form.role === 'ROLE_EMPLOYEE' ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
              >
                Employee
              </button>
              <button
                type="button"
                @click="form.role = 'ROLE_ADMIN'"
                class="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
                :class="form.role === 'ROLE_ADMIN' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
              >
                Admin
              </button>
            </div>
          </div>

          <!-- Role Option Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              @click="form.role = 'ROLE_EMPLOYEE'"
              class="relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
              :class="form.role === 'ROLE_EMPLOYEE' 
                ? 'bg-teal-500/10 border-teal-500/50 ring-1 ring-teal-500/40' 
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="form.role === 'ROLE_EMPLOYEE' ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 dark:text-white">Employee</span>
                  <span class="text-[10px] font-mono font-medium text-teal-600 dark:text-teal-400">ROLE_EMPLOYEE</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard member access to tasks & dashboard
                </p>
              </div>
            </button>

            <button
              type="button"
              @click="form.role = 'ROLE_ADMIN'"
              class="relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
              :class="form.role === 'ROLE_ADMIN' 
                ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/40' 
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="form.role === 'ROLE_ADMIN' ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 dark:text-white">Administrator</span>
                  <span class="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">ROLE_ADMIN</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Full administrative permissions & management
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- Enabled / Active Status Toggle -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Account Status</div>
            <div class="text-[11px] text-slate-400">Enable or disable access to StaffSync applications</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0 self-start xs:self-auto">
            <input
              type="checkbox"
              v-model="form.enabled"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span class="ml-2 text-xs font-semibold" :class="form.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
              {{ form.enabled ? 'Active / Enabled' : 'Disabled' }}
            </span>
          </label>
        </div>

        <!-- Action Buttons -->
        <div class="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            class="w-full xs:w-auto text-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full xs:w-auto text-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition active:scale-95"
          >
            {{ userToEdit ? 'Save Changes' : 'Register Member' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
