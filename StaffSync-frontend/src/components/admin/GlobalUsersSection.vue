<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminDataStore, type AdminUser } from '@/stores/adminData'

const emit = defineEmits<{
  (e: 'addUser'): void
  (e: 'editUser', user: AdminUser): void
  (e: 'deleteUser', user: AdminUser): void
  (e: 'viewUserTasks', user: AdminUser): void
  (e: 'viewDepartment', deptId: string | number): void
}>()

const adminStore = useAdminDataStore()

const searchQuery = ref('')
const deptFilter = ref<string | number>('All')

const filteredUsers = computed(() => {
  let list = adminStore.users

  if (deptFilter.value !== 'All') {
    list = list.filter((u) => String(u.departmentId) === String(deptFilter.value))
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
  <div class="space-y-4 animate-fade-in">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="relative flex-1">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search all company personnel by name, username, email, or role..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500"
        />
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="deptFilter"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-emerald-500"
        >
          <option value="All">All Departments</option>
          <option v-for="dept in adminStore.departments" :key="dept.id" :value="dept.id">
            {{ dept.name }} ({{ dept.code }})
          </option>
        </select>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
          @click="emit('addUser')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Member
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th class="py-4 px-6">Personnel</th>
              <th class="py-4 px-4">Department</th>
              <th class="py-4 px-4">Role & Status</th>
              <th class="py-4 px-4">Active Tasks</th>
              <th class="py-4 px-6 text-right">Quick Navigation</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <img :src="user.avatarUrl" alt="" class="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">{{ user.name }}</div>
                    <div class="text-xs text-slate-400">{{ user.email }} &bull; @{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <button
                  v-if="user.departmentId"
                  type="button"
                  class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  @click="emit('viewDepartment', user.departmentId)"
                >
                  {{ adminStore.getDepartmentById(user.departmentId)?.name || `Dept #${user.departmentId}` }}
                </button>
                <span v-else class="text-xs text-slate-400 italic">Unassigned</span>
              </td>
              <td class="py-4 px-4">
                <div class="text-xs font-semibold text-slate-800 dark:text-slate-200">{{ user.role }}</div>
                <span
                  class="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold"
                  :class="user.enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-500'"
                >
                  {{ user.enabled ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  {{ adminStore.getTasksByUser(user.id).length }} Tasks Assigned
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition"
                    @click="emit('viewUserTasks', user)"
                  >
                    Tasks &rarr;
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

            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400 text-sm">
                No personnel found matching your criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
