<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Shift & Attendance Tracker State
type WorkStatus = 'Clocked In' | 'On Break' | 'Clocked Out'
const currentStatus = ref<WorkStatus>('Clocked In')
const secondsElapsed = ref(5 * 3600 + 24 * 60) // default 5h 24m elapsed
let timerInterval: any = null

const currentTimeString = ref('')

function updateClock() {
  const now = new Date()
  currentTimeString.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(() => {
  updateClock()
  timerInterval = setInterval(() => {
    updateClock()
    if (currentStatus.value === 'Clocked In') {
      secondsElapsed.value += 1
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const formattedWorkedTime = computed(() => {
  const hours = Math.floor(secondsElapsed.value / 3600)
  const minutes = Math.floor((secondsElapsed.value % 3600) / 60)
  const seconds = secondsElapsed.value % 60
  return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
})

// Notifications
const notification = ref<string | null>(null)
function showToast(msg: string) {
  notification.value = msg
  setTimeout(() => {
    if (notification.value === msg) {
      notification.value = null
    }
  }, 4000)
}

function handleClockToggle() {
  if (currentStatus.value === 'Clocked Out') {
    currentStatus.value = 'Clocked In'
    showToast('Successfully clocked in for your shift!')
  } else {
    currentStatus.value = 'Clocked Out'
    showToast('Shift ended. You have successfully clocked out!')
  }
}

function handleBreakToggle() {
  if (currentStatus.value === 'Clocked In') {
    currentStatus.value = 'On Break'
    showToast('Break started. Enjoy your rest!')
  } else if (currentStatus.value === 'On Break') {
    currentStatus.value = 'Clocked In'
    showToast('Welcome back! Resumed active shift.')
  }
}

// Weekly Schedule Data
interface ShiftDay {
  id: number
  day: string
  date: string
  shift: string
  role: string
  location: string
  status: 'Completed' | 'Current' | 'Scheduled' | 'Day Off'
}

const weeklySchedule = ref<ShiftDay[]>([
  { id: 1, day: 'Mon', date: 'Oct 19', shift: '09:00 - 17:30', role: 'Staff Operations', location: 'Building A, Floor 3', status: 'Completed' },
  { id: 2, day: 'Tue', date: 'Oct 20', shift: '09:00 - 17:30', role: 'Staff Operations', location: 'Building A, Floor 3', status: 'Completed' },
  { id: 3, day: 'Wed', date: 'Oct 21', shift: '09:00 - 17:30', role: 'Remote Work', location: 'Virtual Pod 2', status: 'Completed' },
  { id: 4, day: 'Thu', date: 'Oct 22', shift: '09:00 - 17:30', role: 'Staff Operations', location: 'Building A, Floor 3', status: 'Current' },
  { id: 5, day: 'Fri', date: 'Oct 23', shift: '09:00 - 17:00', role: 'Staff Operations', location: 'Building A, Floor 3', status: 'Scheduled' },
  { id: 6, day: 'Sat', date: 'Oct 24', shift: 'Weekend Off', role: 'Rest Day', location: 'None', status: 'Day Off' },
  { id: 7, day: 'Sun', date: 'Oct 25', shift: 'Weekend Off', role: 'Rest Day', location: 'None', status: 'Day Off' },
])

// Leave & PTO Management
interface LeaveRequest {
  id: number
  type: string
  startDate: string
  endDate: string
  days: number
  status: 'Approved' | 'Pending Review' | 'Declined'
}

const leaveRequests = ref<LeaveRequest[]>([
  { id: 1, type: 'Annual Paid Leave', startDate: 'Nov 12, 2026', endDate: 'Nov 16, 2026', days: 5, status: 'Approved' },
  { id: 2, type: 'Remote Shift Day', startDate: 'Oct 28, 2026', endDate: 'Oct 28, 2026', days: 1, status: 'Pending Review' },
])

const isLeaveModalOpen = ref(false)
const newLeave = ref({
  type: 'Annual Vacation',
  startDate: '',
  endDate: '',
  reason: '',
})

function handleRequestLeave() {
  if (!newLeave.value.startDate || !newLeave.value.endDate) return

  leaveRequests.value.unshift({
    id: Date.now(),
    type: newLeave.value.type,
    startDate: newLeave.value.startDate,
    endDate: newLeave.value.endDate,
    days: 2,
    status: 'Pending Review',
  })

  newLeave.value = {
    type: 'Annual Vacation',
    startDate: '',
    endDate: '',
    reason: '',
  }
  isLeaveModalOpen.value = false
  showToast('Time off request submitted to your administrator!')
}

// Announcements
const announcements = ref([
  {
    id: 1,
    title: 'Monthly Staff Health & Safety Briefing',
    date: 'Today at 09:30 AM',
    author: 'HR Administration',
    content: 'All team members on morning and afternoon shifts are invited to the Q4 safety walkthrough in Auditorium B.',
  },
  {
    id: 2,
    title: 'Upcoming Public Holiday Schedule',
    date: 'Yesterday',
    author: 'Operations Director',
    content: 'Holiday shift rosters have been published. Please review your scheduled hours in the weekly view.',
  },
])

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="flex-1 min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
    <!-- Notification Toast -->
    <div
      v-if="notification"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-3 py-3 px-5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700/30 animate-fade-in"
    >
      <div class="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></div>
      <span class="text-sm font-medium">{{ notification }}</span>
      <button
        type="button"
        class="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900 text-lg leading-none"
        @click="notification = null"
      >
        &times;
      </button>
    </div>

    <!-- Main Workspace Container -->
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Top Bar: Greeting & Employee Identity -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Employee Workspace
            </h1>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Synchronized Roster
            </span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong class="text-slate-800 dark:text-slate-200">{{ authStore.user?.username || 'Employee' }}</strong>
            with designated role
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              ROLE_EMPLOYEE
            </span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition active:scale-95"
            @click="isLeaveModalOpen = true"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Request Time Off
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-sm font-semibold transition"
            @click="handleLogout"
            title="Log out from employee session"
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

      <!-- Live Shift Punch Card Banner -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <!-- Background decorative glow -->
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <!-- Left: Shift state info -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                :class="{
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': currentStatus === 'Clocked In',
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30': currentStatus === 'On Break',
                  'bg-slate-700/60 text-slate-300 border border-slate-600': currentStatus === 'Clocked Out',
                }"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-emerald-400 animate-pulse': currentStatus === 'Clocked In',
                    'bg-amber-400': currentStatus === 'On Break',
                    'bg-slate-400': currentStatus === 'Clocked Out',
                  }"
                ></span>
                {{ currentStatus }}
              </span>
              <span class="text-xs text-slate-400">Station: Operational Staff Sync Pod</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Shift Roster: 09:00 - 17:30
            </h2>
            <p class="text-sm text-slate-300">
              Current local time: <strong class="font-mono text-teal-300">{{ currentTimeString }}</strong>
            </p>
          </div>

          <!-- Middle: Time elapsed counter -->
          <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 text-center lg:text-left">
            <span class="text-xs font-semibold uppercase tracking-wider text-teal-300">Active Shift Duration</span>
            <div class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-1">
              {{ formattedWorkedTime }}
            </div>
            <span class="text-[11px] text-slate-400">Target daily: 8.0 hrs standard</span>
          </div>

          <!-- Right: Clocking Buttons -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-5 py-3 rounded-xl font-semibold text-sm transition shadow-lg active:scale-95 flex items-center gap-2"
              :class="
                currentStatus === 'Clocked Out'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-rose-500/90 hover:bg-rose-500 text-white'
              "
              @click="handleClockToggle"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ currentStatus === 'Clocked Out' ? 'Punch In Shift' : 'Punch Out (End)' }}
            </button>

            <button
              v-if="currentStatus !== 'Clocked Out'"
              type="button"
              class="px-4 py-3 rounded-xl font-semibold text-sm border transition active:scale-95 flex items-center gap-2"
              :class="
                currentStatus === 'On Break'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              "
              @click="handleBreakToggle"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              {{ currentStatus === 'On Break' ? 'End Break' : 'Take Break' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Metric 1 -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Weekly Total</span>
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-slate-900 dark:text-white">34.5</span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">/ 40.0 hrs</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-3">
            <div class="bg-teal-500 h-full rounded-full" style="width: 86%"></div>
          </div>
        </div>

        <!-- Metric 2 -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Paid Leave Balance</span>
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-slate-900 dark:text-white">14</span>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Days available</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Annual allocation refreshed</p>
        </div>

        <!-- Metric 3 -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Shift Punctuality</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-slate-900 dark:text-white">99%</span>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Exemplary</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Last 30 shifts recorded</p>
        </div>

        <!-- Metric 4: Role Credentials -->
        <div class="bg-gradient-to-br from-teal-900 to-slate-900 text-white border border-teal-700/40 rounded-2xl p-5 shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-teal-300">Staff Authority</span>
            <div class="w-10 h-10 rounded-xl bg-white/10 text-teal-300 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-2xl font-black tracking-tight text-white font-mono">ROLE_EMPLOYEE</span>
          </div>
          <p class="text-xs text-teal-200/80 mt-1">Staff Access & Shift Self-Service</p>
        </div>
      </div>

      <!-- Main Layout: Weekly Shift Roster & Leave/Announcements -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Weekly Schedule Table (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                  Weekly Shift Roster
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assigned operational shifts synchronized by Administration
                </p>
              </div>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Oct 19 - Oct 25
              </span>
            </div>

            <!-- Schedule Items -->
            <div class="space-y-3">
              <div
                v-for="shift in weeklySchedule"
                :key="shift.id"
                class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition"
                :class="{
                  'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 shadow-xs ring-1 ring-teal-500/20':
                    shift.status === 'Current',
                  'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60':
                    shift.status !== 'Current',
                }"
              >
                <!-- Day & Date -->
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs"
                    :class="{
                      'bg-teal-600 text-white shadow-sm': shift.status === 'Current',
                      'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200': shift.status !== 'Current',
                    }"
                  >
                    <span>{{ shift.day }}</span>
                    <span class="text-[10px] font-normal opacity-80">{{ shift.date.split(' ')[1] }}</span>
                  </div>

                  <div>
                    <div class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {{ shift.shift }}
                      <span
                        v-if="shift.status === 'Current'"
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-white"
                      >
                        Today
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {{ shift.role }} &bull; {{ shift.location }}
                    </div>
                  </div>
                </div>

                <!-- Shift Status Pill -->
                <div class="mt-3 sm:mt-0 flex items-center gap-3">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800':
                        shift.status === 'Completed',
                      'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800':
                        shift.status === 'Current',
                      'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800':
                        shift.status === 'Scheduled',
                      'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700':
                        shift.status === 'Day Off',
                    }"
                  >
                    {{ shift.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Off / Leave Requests Section -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                  My Time-off Requests
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  History of submitted leave applications
                </p>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                @click="isLeaveModalOpen = true"
              >
                + New Request
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="leave in leaveRequests"
                :key="leave.id"
                class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div>
                  <div class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ leave.type }} ({{ leave.days }} day{{ leave.days > 1 ? 's' : '' }})
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {{ leave.startDate }} &mdash; {{ leave.endDate }}
                  </div>
                </div>

                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800':
                      leave.status === 'Approved',
                    'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800':
                      leave.status === 'Pending Review',
                  }"
                >
                  {{ leave.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Team Announcements & Session Details -->
        <div class="space-y-6">
          <!-- Session Token & Authority Card -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Employee Credentials
            </h3>

            <div class="space-y-3">
              <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>Bearer Token</span>
                  <span class="text-teal-600 dark:text-teal-400 font-semibold">Verified</span>
                </div>
                <p class="font-mono text-slate-700 dark:text-slate-300 truncate select-all">
                  {{ authStore.token || 'No active token' }}
                </p>
              </div>

              <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400">Assigned Role</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {{ authStore.roles.join(', ') || 'ROLE_EMPLOYEE' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400">Shift Clock Access</span>
                  <span class="text-teal-600 dark:text-teal-400 font-medium">Enabled</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400">Leave Requests</span>
                  <span class="text-teal-600 dark:text-teal-400 font-medium">Self-Service</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Announcements Board -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Company Announcements
            </h3>

            <div class="space-y-4">
              <div
                v-for="item in announcements"
                :key="item.id"
                class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 space-y-1.5"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-900 dark:text-slate-100">{{ item.title }}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {{ item.content }}
                </p>
                <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/30 dark:border-slate-700/30">
                  <span>{{ item.author }}</span>
                  <span>{{ item.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Request Time Off -->
    <div
      v-if="isLeaveModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Request Time Off
          </h2>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
            @click="isLeaveModalOpen = false"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="handleRequestLeave" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Leave Category
            </label>
            <select
              v-model="newLeave.type"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
            >
              <option value="Annual Vacation">Annual Vacation</option>
              <option value="Sick Leave">Medical / Sick Leave</option>
              <option value="Remote Work Day">Remote Work Request</option>
              <option value="Personal / Family">Personal Emergency</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                v-model="newLeave.startDate"
                required
                type="date"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                v-model="newLeave.endDate"
                required
                type="date"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Reason / Notes (Optional)
            </label>
            <textarea
              v-model="newLeave.reason"
              rows="3"
              placeholder="Provide any details for your supervisor..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 resize-none"
            ></textarea>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              @click="isLeaveModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-sm font-semibold text-white shadow-md shadow-teal-600/20"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
