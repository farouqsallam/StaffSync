<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminDataStore, type Department, type AdminUser, type AdminTask } from '@/stores/adminData'

const props = defineProps<{
  user: AdminUser
  department: Department
}>()

const emit = defineEmits<{
  (e: 'assignTask'): void
  (e: 'editTask', task: AdminTask): void
  (e: 'deleteTask', task: AdminTask): void
  (e: 'statusChange', task: AdminTask, newStatus: 'Todo' | 'In Progress' | 'Completed'): void
  (e: 'editUser', user: AdminUser): void
  (e: 'back'): void
}>()

const adminStore = useAdminDataStore()

const searchQuery = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const viewMode = ref<'cards' | 'kanban'>('cards')

const userTasks = computed(() => {
  let list = adminStore.getTasksByUser(props.user.id)

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

function getPriorityBadgeClass(priority: AdminTask['priority']) {
  switch (priority) {
    case 'High':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
    case 'Medium':
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20'
    case 'Low':
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
  }
}

function getStatusBadgeClass(status: AdminTask['status']) {
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
  <div class="space-y-5 animate-fade-in">
    <!-- Active User Dossier Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-start gap-4">
        <img
          :src="user.avatarUrl"
          :alt="user.name"
          class="w-16 h-16 rounded-3xl object-cover border-2 border-emerald-500/30 shadow-md shrink-0"
        />
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {{ user.name }}
            </h2>
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="user.enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'"
            >
              {{ user.enabled ? 'Active' : 'Disabled' }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ user.role }} &bull; Department:
            <strong class="text-slate-800 dark:text-slate-200">{{ department.name }} ({{ department.code }})</strong>
          </p>

          <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
            <span>{{ user.email }}</span>
            <span>&bull;</span>
            <span class="font-mono">@{{ user.username }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          @click="emit('back')"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Team
        </button>

        <button
          type="button"
          class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          @click="emit('editUser', user)"
        >
          Edit Profile
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-600/20 transition active:scale-95"
          @click="emit('assignTask')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Assign Task
        </button>
      </div>
    </div>

    <!-- Tasks Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="relative flex-1">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search assigned tasks by title or description..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="statusFilter"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-amber-500"
        >
          <option value="All">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          v-model="priorityFilter"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-amber-500"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-medium transition"
            :class="viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'"
            @click="viewMode = 'cards'"
            title="Card List"
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
            title="Kanban Board"
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
      v-if="userTasks.length === 0"
      class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs"
    >
      <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">No Tasks Assigned</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        {{ searchQuery ? `No tasks found matching "${searchQuery}".` : `${user.name} does not have any tasks matching your filters.` }}
      </p>
      <button
        v-if="!searchQuery"
        type="button"
        class="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition"
        @click="emit('assignTask')"
      >
        + Assign First Task
      </button>
    </div>

    <!-- Cards View -->
    <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="task in userTasks"
        :key="task.id"
        class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
      >
        <div>
          <!-- Header: Priority, Actions -->
          <div class="flex items-center justify-between gap-3 mb-2.5">
            <span class="px-2 py-0.5 rounded-lg text-xs font-semibold" :class="getPriorityBadgeClass(task.priority)">
              {{ task.priority }} Priority
            </span>

            <div class="flex items-center gap-1">
              <button
                type="button"
                class="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Edit Task"
                @click="emit('editTask', task)"
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
                @click="emit('deleteTask', task)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          <h4 class="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {{ task.title }}
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {{ task.description || 'No additional details provided.' }}
          </p>
        </div>

        <!-- Footer: Due Date & Status Selector -->
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 text-slate-400">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Due {{ task.dueDate || 'No target' }}</span>
          </div>

          <select
            :value="task.status"
            class="px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer outline-none transition"
            :class="getStatusBadgeClass(task.status)"
            @change="emit('statusChange', task, ($event.target as HTMLSelectElement).value as any)"
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Kanban View -->
    <div v-else-if="viewMode === 'kanban'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="col in ['Todo', 'In Progress', 'Completed'] as const"
        :key="col"
        class="bg-slate-100/70 dark:bg-slate-900/50 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-800/60 flex flex-col min-h-[380px]"
      >
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {{ col }}
          </span>
          <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
            {{ userTasks.filter(t => t.status === col).length }}
          </span>
        </div>

        <div class="space-y-3 flex-1 overflow-y-auto">
          <div
            v-for="task in userTasks.filter(t => t.status === col)"
            :key="task.id"
            class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition"
          >
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="getPriorityBadgeClass(task.priority)">
                {{ task.priority }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">{{ task.dueDate }}</span>
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
                @change="emit('statusChange', task, ($event.target as HTMLSelectElement).value as any)"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="p-1 text-slate-400 hover:text-amber-500"
                  title="Edit"
                  @click="emit('editTask', task)"
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
                  @click="emit('deleteTask', task)"
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
            v-if="userTasks.filter(t => t.status === col).length === 0"
            class="py-8 text-center text-slate-400 text-xs italic"
          >
            No tasks in this lane
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
