<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAdminDataStore, type AdminUser } from '@/stores/adminData'

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
    },
  ): void
}>()

const adminStore = useAdminDataStore()

const form = ref<{
  username: string
  password: string
  fullName: string
  email: string
  jobTitle: string
  enabled: boolean
  departmentId: string | number
}>({
  username: '',
  password: '',
  fullName: '',
  email: '',
  jobTitle: '',
  enabled: true,
  departmentId: '',
})

watch(
  () => [props.userToEdit, props.defaultDepartmentId, props.isOpen],
  () => {
    if (props.userToEdit) {
      form.value = {
        username: props.userToEdit.username || '',
        password: '',
        fullName: props.userToEdit.fullName || props.userToEdit.name || '',
        email: props.userToEdit.email || '',
        jobTitle: props.userToEdit.jobTitle || props.userToEdit.role || '',
        enabled: props.userToEdit.enabled !== false,
        departmentId: props.userToEdit.departmentId || adminStore.departments[0]?.id || '',
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

  if (!props.userToEdit || form.value.password.trim()) {
    payload.password = form.value.password.trim() || 'password123'
  }

  emit('save', payload)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">
              {{ userToEdit ? 'Edit Personnel' : 'Add New Team Member' }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ userToEdit ? 'Update account credentials & assignment' : 'Register a new member to the roster' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

        <!-- Enabled / Active Status Toggle -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Account Status</div>
            <div class="text-[11px] text-slate-400">Enable or disable access to StaffSync applications</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
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
        <div class="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition active:scale-95"
          >
            {{ userToEdit ? 'Save Changes' : 'Register Member' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
