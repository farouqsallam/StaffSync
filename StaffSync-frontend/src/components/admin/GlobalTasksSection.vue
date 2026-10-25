<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminDataStore, type AdminTask } from '@/stores/adminData'

const emit = defineEmits<{
  (e: 'addTask'): void
  (e: 'editTask', task: AdminTask): void
  (e: 'deleteTask', task: AdminTask): void
  (e: 'statusChange', task: AdminTask, newStatus: 'Todo' | 'In Progress' | 'Completed'): void
}>()

const adminStore = useAdminDataStore()

const searchQuery = ref('')
const deptFilter = ref<string | number>('All')

const filteredTasks = computed(() => {
  let list = adminStore.tasks

  if (deptFilter.value !== 'All') {
    list = adminStore.getTasksByDepartment(deptFilter.value)
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

function getAssigneeName(task: AdminTask): string {
  const firstId = task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : task.userId
  if (!firstId) return 'Unassigned'
  const user = adminStore.getUserById(firstId)
  return user?.name || `User #${firstId}`
}

function getAssigneeAvatar(task: AdminTask): string {
  const firstId = task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : task.userId
  if (!firstId) return ''
  const user = adminStore.getUserById(firstId)
  return user?.avatarUrl || ''
}
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
          placeholder="Search company-wide tasks by title or description..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500"
        />
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="deptFilter"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-amber-500"
        >
          <option value="All">All Departments</option>
          <option v-for="dept in adminStore.departments" :key="dept.id" :value="dept.id">
            {{ dept.name }} ({{ dept.code }})
          </option>
        </select>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
          @click="emit('addTask')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>
    </div>

    <!-- Tasks Table -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th class="py-4 px-6">Task Objective</th>
              <th class="py-4 px-4">Assignee</th>
              <th class="py-4 px-4">Priority</th>
              <th class="py-4 px-4">Status</th>
              <th class="py-4 px-4">Target Due</th>
              <th class="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <tr
              v-for="task in filteredTasks"
              :key="task.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="py-4 px-6">
                <div class="font-bold text-slate-900 dark:text-white leading-snug">{{ task.title }}</div>
                <div class="text-xs text-slate-400 line-clamp-1 mt-0.5">{{ task.description || 'No description' }}</div>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <img
                    v-if="getAssigneeAvatar(task)"
                    :src="getAssigneeAvatar(task)"
                    alt=""
                    class="w-7 h-7 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300"
                  >
                    {{ getAssigneeName(task).charAt(0) }}
                  </div>
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {{ getAssigneeName(task) }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="px-2 py-0.5 rounded text-xs font-bold" :class="getPriorityBadgeClass(task.priority)">
                  {{ task.priority }}
                </span>
              </td>
              <td class="py-4 px-4">
                <select
                  :value="task.status"
                  class="px-2 py-0.5 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                  :class="getStatusBadgeClass(task.status)"
                  @change="emit('statusChange', task, ($event.target as HTMLSelectElement).value as any)"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td class="py-4 px-4 text-xs font-mono text-slate-500">
                {{ task.dueDate || 'N/A' }}
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-amber-500"
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
                    class="p-1.5 text-slate-400 hover:text-rose-500"
                    title="Delete Task"
                    @click="emit('deleteTask', task)"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredTasks.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 text-sm">
                No tasks found matching your filter criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
