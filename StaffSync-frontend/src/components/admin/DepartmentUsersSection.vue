<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useAdminDataStore,
  getInitials,
  getAvatarColor,
  type Department,
  type AdminUser,
} from '@/stores/adminData'

const props = defineProps<{
  department: Department
}>()

const emit = defineEmits<{
  (e: 'drillUser', userId: string | number): void
  (e: 'addUser'): void
  (e: 'editUser', user: AdminUser): void
  (e: 'deleteUser', user: AdminUser): void
  (e: 'back'): void
}>()

const adminStore = useAdminDataStore()

const searchQuery = ref('')
const statusFilter = ref('All')
const viewMode = ref<'grid' | 'table'>('grid')

const departmentUsers = computed(() => {
  let list = adminStore.getUsersByDepartment(props.department.id)

  if (statusFilter.value !== 'All') {
    list = list.filter((u) => u.status === statusFilter.value)
  }

  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    )
  }
  return list
})
</script>

<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Active Department Banner Header -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-black text-xl shadow-inner shrink-0">
          {{ department.code }}
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {{ department.name }}
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ adminStore.getUsersByDepartment(department.id).length }} Team Members
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Department Code: <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ department.code }}</strong>
            &bull; ID: {{ department.id }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          @click="emit('back')"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Departments
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95"
          @click="emit('addUser')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Team Member
        </button>
      </div>
    </div>

    <!-- Toolbar: Search, Status Filter & View Mode Toggle -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="relative flex-1">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search personnel by name, username, email, or role..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500"
        />
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <select
          v-model="statusFilter"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-emerald-500"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave / Disabled</option>
        </select>

        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-medium transition"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'"
            @click="viewMode = 'grid'"
            title="Card Grid"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-medium transition"
            :class="viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'"
            @click="viewMode = 'table'"
            title="Table View"
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
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="departmentUsers.length === 0"
      class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs"
    >
      <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">No Personnel In This Department</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        {{ searchQuery ? `No personnel matching "${searchQuery}".` : 'Add team members and assign them to this department.' }}
      </p>
      <button
        v-if="!searchQuery"
        type="button"
        class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
        @click="emit('addUser')"
      >
        + Add Team Member
      </button>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="user in departmentUsers"
        :key="user.id"
        class="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
        @click="emit('drillUser', user.id)"
      >
        <div>
          <!-- Header: Avatar, Name, Status, Actions -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-2xl font-bold text-base flex items-center justify-center border shadow-xs shrink-0 select-none"
                :class="getAvatarColor(user.name)"
              >
                {{ getInitials(user.name) }}
              </div>
              <div>
                <h4 class="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {{ user.name }}
                </h4>
                <div class="text-xs text-slate-400">{{ user.email }}</div>
                <div class="text-[11px] font-mono text-slate-400">@{{ user.username }}</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1" @click.stop>
              <button
                type="button"
                class="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Edit User"
                @click="emit('editUser', user)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Delete User"
                @click="emit('deleteUser', user)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Role & Status -->
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ user.jobTitle }}</span>
              <span
                v-if="user.role === 'ROLE_ADMIN'"
                class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                ADMIN
              </span>
            </div>
            <span
              class="px-2 py-0.5 rounded-full font-semibold text-[11px]"
              :class="user.enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'"
            >
              {{ user.enabled ? 'Active' : 'Disabled' }}
            </span>
          </div>

          <!-- Task Deliverables Progress -->
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs font-semibold mb-1">
              <span class="text-slate-500">Tasks Completed</span>
              <span class="text-slate-900 dark:text-white font-mono">
                {{ adminStore.getTasksByUser(user.id).filter(t => t.status === 'Completed').length }} /
                {{ adminStore.getTasksByUser(user.id).length }}
              </span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                :style="{
                  width: adminStore.getTasksByUser(user.id).length
                    ? `${(adminStore.getTasksByUser(user.id).filter(t => t.status === 'Completed').length / adminStore.getTasksByUser(user.id).length) * 100}%`
                    : '0%'
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {{ adminStore.getTasksByUser(user.id).length }} Tasks Assigned
          </span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition">
            View Tasks &rarr;
          </span>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th class="py-4 px-6">Personnel</th>
              <th class="py-4 px-4">Role / Title</th>
              <th class="py-4 px-4">Status</th>
              <th class="py-4 px-4">Tasks</th>
              <th class="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <tr
              v-for="user in departmentUsers"
              :key="user.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
              @click="emit('drillUser', user.id)"
            >
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border shrink-0 select-none"
                    :class="getAvatarColor(user.name)"
                  >
                    {{ getInitials(user.name) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">{{ user.name }}</div>
                    <div class="text-xs text-slate-400">{{ user.email }} &bull; @{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span>{{ user.jobTitle }}</span>
                  <span
                    v-if="user.role === 'ROLE_ADMIN'"
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    ADMIN
                  </span>
                </div>
              </td>
              <td class="py-4 px-4">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="user.enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'"
                >
                  {{ user.enabled ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ adminStore.getTasksByUser(user.id).length }} tasks
                </span>
              </td>
              <td class="py-4 px-6 text-right" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition"
                    @click="emit('drillUser', user.id)"
                  >
                    View Tasks
                  </button>
                  <button
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Edit User"
                    @click="emit('editUser', user)"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Delete User"
                    @click="emit('deleteUser', user)"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
