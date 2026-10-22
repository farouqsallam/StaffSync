<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const selectedDepartment = ref('All')
const selectedStatus = ref('All')
const isAddModalOpen = ref(false)
const isProfileModalOpen = ref(false)
const selectedStaffMember = ref<StaffMember | null>(null)
const notification = ref<string | null>(null)

export interface StaffMember {
  id: number
  name: string
  email: string
  department: string
  role: string
  status: 'On Shift' | 'On Break' | 'Off Duty'
  shiftTime: string
  attendanceRate: number
  avatarUrl: string
}

const departments = ['All', 'Engineering', 'Operations', 'Healthcare', 'Customer Support', 'Administration']
const statuses = ['All', 'On Shift', 'On Break', 'Off Duty']

// Initial Staff Sync Mock Data
const staffList = ref<StaffMember[]>([
  {
    id: 1,
    name: 'Sarah Jenkins',
    email: 'sarah.j@staffsync.io',
    department: 'Engineering',
    role: 'Lead Architect',
    status: 'On Shift',
    shiftTime: '08:00 - 16:30',
    attendanceRate: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Marcus Vance',
    email: 'marcus.v@staffsync.io',
    department: 'Operations',
    role: 'Operations Director',
    status: 'On Shift',
    shiftTime: '09:00 - 17:30',
    attendanceRate: 95,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'elena.r@staffsync.io',
    department: 'Healthcare',
    role: 'Clinical Specialist',
    status: 'On Break',
    shiftTime: '07:00 - 15:30',
    attendanceRate: 99,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'David Chen',
    email: 'david.c@staffsync.io',
    department: 'Customer Support',
    role: 'Support Manager',
    status: 'On Shift',
    shiftTime: '10:00 - 18:30',
    attendanceRate: 92,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Amina Diallo',
    email: 'amina.d@staffsync.io',
    department: 'Engineering',
    role: 'Senior DevOps',
    status: 'Off Duty',
    shiftTime: 'Night Shift (22:00 - 06:30)',
    attendanceRate: 97,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    name: 'James Reynolds',
    email: 'james.r@staffsync.io',
    department: 'Administration',
    role: 'HR Specialist',
    status: 'Off Duty',
    shiftTime: '08:30 - 17:00',
    attendanceRate: 94,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  },
])

// Activity Logs
const activityLogs = ref([
  {
    id: 1,
    action: 'Shift Check-in',
    target: 'Sarah Jenkins clocked in to Engineering pod A',
    time: '12 mins ago',
    type: 'success',
  },
  {
    id: 2,
    action: 'Roster Synchronization',
    target: 'Automated sync with Central Roster DB completed',
    time: '45 mins ago',
    type: 'sync',
  },
  {
    id: 3,
    action: 'Role Verification',
    target: 'Administrator session authenticated under ROLE_ADMIN',
    time: 'Just now',
    type: 'security',
  },
])

// New Staff Form state
const newStaff = ref({
  name: '',
  email: '',
  department: 'Engineering',
  role: '',
  shiftTime: '09:00 - 17:00',
  status: 'On Shift' as 'On Shift' | 'On Break' | 'Off Duty',
})

// Metrics
const totalStaffCount = computed(() => staffList.value.length)
const onShiftCount = computed(() => staffList.value.filter((s) => s.status === 'On Shift').length)
const onBreakCount = computed(() => staffList.value.filter((s) => s.status === 'On Break').length)
const avgAttendanceRate = computed(() => {
  if (!staffList.value.length) return 0
  const sum = staffList.value.reduce((acc, curr) => acc + curr.attendanceRate, 0)
  return Math.round(sum / staffList.value.length)
})

// Filtered Staff
const filteredStaff = computed(() => {
  return staffList.value.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesDept =
      selectedDepartment.value === 'All' || staff.department === selectedDepartment.value

    const matchesStatus =
      selectedStatus.value === 'All' || staff.status === selectedStatus.value

    return matchesSearch && matchesDept && matchesStatus
  })
})

function showToast(msg: string) {
  notification.value = msg
  setTimeout(() => {
    if (notification.value === msg) {
      notification.value = null
    }
  }, 4000)
}

function handleAddStaff() {
  if (!newStaff.value.name || !newStaff.value.email || !newStaff.value.role) {
    return
  }

  const created: StaffMember = {
    id: Date.now(),
    name: newStaff.value.name,
    email: newStaff.value.email,
    department: newStaff.value.department,
    role: newStaff.value.role,
    status: newStaff.value.status,
    shiftTime: newStaff.value.shiftTime,
    attendanceRate: 100,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
  }

  staffList.value.unshift(created)
  activityLogs.value.unshift({
    id: Date.now(),
    action: 'New Staff Registered',
    target: `${created.name} (${created.department}) added to roster`,
    time: 'Just now',
    type: 'success',
  })

  // Reset form
  newStaff.value = {
    name: '',
    email: '',
    department: 'Engineering',
    role: '',
    shiftTime: '09:00 - 17:00',
    status: 'On Shift',
  }
  isAddModalOpen.value = false
  showToast(`Successfully registered ${created.name} to the roster!`)
}

function toggleStaffStatus(staff: StaffMember) {
  const nextStatus: Record<StaffMember['status'], StaffMember['status']> = {
    'On Shift': 'On Break',
    'On Break': 'Off Duty',
    'Off Duty': 'On Shift',
  }

  const prev = staff.status
  staff.status = nextStatus[prev]

  activityLogs.value.unshift({
    id: Date.now(),
    action: 'Shift Status Updated',
    target: `${staff.name} changed status from ${prev} to ${staff.status}`,
    time: 'Just now',
    type: 'sync',
  })
  showToast(`${staff.name}'s status updated to ${staff.status}`)
}

function openProfile(staff: StaffMember) {
  selectedStaffMember.value = staff
  isProfileModalOpen.value = true
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="flex-1 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
    <!-- Notification Banner -->
    <div
      v-if="notification"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-3 py-3 px-5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700/30 animate-fade-in"
    >
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
      <span class="text-sm font-medium">{{ notification }}</span>
      <button
        type="button"
        class="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900 text-lg leading-none"
        @click="notification = null"
      >
        &times;
      </button>
    </div>

    <!-- Main Container -->
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Top Bar: Greeting & Admin Credentials Badge -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Admin Synchronization Console
            </h1>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong class="text-slate-800 dark:text-slate-200">{{ authStore.user?.username || 'Administrator' }}</strong>
            with authority
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              ROLE_ADMIN
            </span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-sm transition active:scale-95"
            @click="showToast('Roster data re-synchronized successfully with backend!')"
          >
            <svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Sync Now
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95"
            @click="isAddModalOpen = true"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Staff
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-sm font-semibold transition"
            @click="handleLogout"
            title="Log out from session"
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

      <!-- KPI Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Stat Card 1 -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Personnel</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ totalStaffCount }}</span>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+12% vs last mo</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Synchronized active records</p>
        </div>

        <!-- Stat Card 2 -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Currently On Shift</span>
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ onShiftCount }}</span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">({{ onBreakCount }} on break)</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Active rosters right now</p>
        </div>

        <!-- Stat Card 3 -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance Index</span>
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ avgAttendanceRate }}%</span>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Optimal</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Overall shift compliance</p>
        </div>

        <!-- Stat Card 4: Access Level -->
        <div class="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700/40 rounded-2xl p-5 shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-indigo-300">Authority Role</span>
            <div class="w-10 h-10 rounded-xl bg-white/10 text-indigo-300 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-2xl font-black tracking-tight text-white font-mono">ROLE_ADMIN</span>
          </div>
          <p class="text-xs text-indigo-200/80 mt-1">Full Read & Write Authorization</p>
        </div>
      </div>

      <!-- Main Section: Staff Roster Table & Activity Feed -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Staff List (Left 2 cols) -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Filters & Search Toolbar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <!-- Search bar -->
            <div class="relative flex-1">
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search staff by name, email, or role..."
                class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-2">
              <select
                v-model="selectedDepartment"
                class="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-emerald-500"
              >
                <option v-for="dept in departments" :key="dept" :value="dept">
                  Dept: {{ dept }}
                </option>
              </select>

              <select
                v-model="selectedStatus"
                class="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-emerald-500"
              >
                <option v-for="status in statuses" :key="status" :value="status">
                  Status: {{ status }}
                </option>
              </select>
            </div>
          </div>

          <!-- Staff Table -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th class="py-3.5 px-4 sm:px-6">Personnel</th>
                    <th class="py-3.5 px-4">Department</th>
                    <th class="py-3.5 px-4">Shift & Schedule</th>
                    <th class="py-3.5 px-4">Status</th>
                    <th class="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm">
                  <tr
                    v-for="staff in filteredStaff"
                    :key="staff.id"
                    class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                  >
                    <!-- Personnel details -->
                    <td class="py-4 px-4 sm:px-6">
                      <div class="flex items-center gap-3">
                        <img
                          :src="staff.avatarUrl"
                          :alt="staff.name"
                          class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <div>
                          <div class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {{ staff.name }}
                          </div>
                          <div class="text-xs text-slate-500 dark:text-slate-400">
                            {{ staff.email }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Department & Role -->
                    <td class="py-4 px-4">
                      <div class="text-xs font-semibold text-slate-900 dark:text-slate-200">
                        {{ staff.department }}
                      </div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">
                        {{ staff.role }}
                      </div>
                    </td>

                    <!-- Shift Time & Attendance -->
                    <td class="py-4 px-4">
                      <div class="text-xs text-slate-700 dark:text-slate-300 font-mono">
                        {{ staff.shiftTime }}
                      </div>
                      <div class="flex items-center gap-1.5 mt-1">
                        <div class="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            class="bg-emerald-500 h-full rounded-full"
                            :style="{ width: `${staff.attendanceRate}%` }"
                          ></div>
                        </div>
                        <span class="text-[11px] font-medium text-slate-500">{{ staff.attendanceRate }}%</span>
                      </div>
                    </td>

                    <!-- Status Pill -->
                    <td class="py-4 px-4">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition hover:opacity-80"
                        :class="{
                          'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800':
                            staff.status === 'On Shift',
                          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800':
                            staff.status === 'On Break',
                          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700':
                            staff.status === 'Off Duty',
                        }"
                        @click="toggleStaffStatus(staff)"
                        title="Click to toggle status"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full"
                          :class="{
                            'bg-emerald-500': staff.status === 'On Shift',
                            'bg-amber-500': staff.status === 'On Break',
                            'bg-slate-400': staff.status === 'Off Duty',
                          }"
                        ></span>
                        {{ staff.status }}
                      </button>
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 text-right">
                      <button
                        type="button"
                        class="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                        @click="openProfile(staff)"
                      >
                        Details
                      </button>
                    </td>
                  </tr>

                  <tr v-if="filteredStaff.length === 0">
                    <td colspan="5" class="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No staff members match the selected criteria.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Audit Logs & Security Panel -->
        <div class="space-y-6">
          <!-- Security Token & Permissions Card -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Active Session Token
            </h3>

            <div class="space-y-3">
              <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>JWT Bearer</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Active & Valid</span>
                </div>
                <p class="font-mono text-slate-700 dark:text-slate-300 truncate select-all">
                  {{ authStore.token || 'No active token' }}
                </p>
              </div>

              <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400">Granted Authorities</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {{ authStore.roles.join(', ') || 'ROLE_ADMIN' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400">Roster Syncing</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-medium">Enabled (Bi-directional)</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400">Staff Editing</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-medium">Full Access</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Real-Time Activity Log -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Recent Audit Trail
              </h3>
              <span class="text-[11px] font-semibold text-slate-400">Live feed</span>
            </div>

            <div class="space-y-3">
              <div
                v-for="log in activityLogs"
                :key="log.id"
                class="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 transition"
              >
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  :class="{
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': log.type === 'success',
                    'bg-teal-500/10 text-teal-600 dark:text-teal-400': log.type === 'sync',
                    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400': log.type === 'security',
                  }"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-900 dark:text-slate-200">{{ log.action }}</span>
                    <span class="text-[10px] text-slate-400">{{ log.time }}</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{{ log.target }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add New Staff Member -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Register Staff Member
          </h2>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
            @click="isAddModalOpen = false"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="handleAddStaff" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              v-model="newStaff.name"
              required
              type="text"
              placeholder="e.g. Jordan Miller"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Work Email
            </label>
            <input
              v-model="newStaff.email"
              required
              type="email"
              placeholder="e.g. jordan.m@staffsync.io"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                v-model="newStaff.department"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              >
                <option v-for="dept in departments.filter((d) => d !== 'All')" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Position / Role
              </label>
              <input
                v-model="newStaff.role"
                required
                type="text"
                placeholder="e.g. Developer"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Shift Hours
            </label>
            <input
              v-model="newStaff.shiftTime"
              type="text"
              placeholder="e.g. 09:00 - 17:00"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div class="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              @click="isAddModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-600/20"
            >
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Staff Profile Details -->
    <div
      v-if="isProfileModalOpen && selectedStaffMember"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Personnel Dossier</span>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
            @click="isProfileModalOpen = false"
          >
            &times;
          </button>
        </div>

        <div class="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <img
            :src="selectedStaffMember.avatarUrl"
            :alt="selectedStaffMember.name"
            class="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-md"
          />
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedStaffMember.name }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ selectedStaffMember.email }}</p>
            <span class="inline-flex mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {{ selectedStaffMember.department }} &bull; {{ selectedStaffMember.role }}
            </span>
          </div>
        </div>

        <div class="py-4 space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Current Status:</span>
            <span class="font-semibold text-slate-800 dark:text-slate-200">{{ selectedStaffMember.status }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Scheduled Hours:</span>
            <span class="font-mono text-slate-800 dark:text-slate-200">{{ selectedStaffMember.shiftTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Attendance Rating:</span>
            <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ selectedStaffMember.attendanceRate }}%</span>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition"
            @click="isProfileModalOpen = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
