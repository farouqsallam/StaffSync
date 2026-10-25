<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminDataStore, type Department } from '@/stores/adminData'

const emit = defineEmits<{
  (e: 'drillDown', deptId: string | number): void
  (e: 'add'): void
  (e: 'edit', dept: Department): void
  (e: 'delete', dept: Department): void
}>()

const adminStore = useAdminDataStore()

const searchQuery = ref('')
const viewMode = ref<'grid' | 'table'>('grid')

const filteredDepartments = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return adminStore.departments
  return adminStore.departments.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.leadName.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q),
  )
})

function getDepartmentColorClass(color: Department['color']) {
  const map: Record<Department['color'], { badge: string; text: string }> = {
    indigo: {
      badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    emerald: {
      badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    violet: {
      badge: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800',
      text: 'text-violet-600 dark:text-violet-400',
    },
    teal: {
      badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800',
      text: 'text-teal-600 dark:text-teal-400',
    },
    amber: {
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
      text: 'text-rose-600 dark:text-rose-400',
    },
    sky: {
      badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800',
      text: 'text-sky-600 dark:text-sky-400',
    },
  }
  return map[color] || map.indigo
}
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <!-- Toolbar: Search, View Mode Toggle, Add Department Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div class="relative flex-1">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search departments by name, code tag..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
        />
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- View Mode Toggle -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-medium transition"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'"
            @click="viewMode = 'grid'"
            title="Card Grid View"
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

        <!-- Add Department Button -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
          @click="emit('add')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Department</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredDepartments.length === 0"
      class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs"
    >
      <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">No Departments Found</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        {{ searchQuery ? `No matches found for "${searchQuery}".` : 'Get started by creating your first organizational department.' }}
      </p>
      <button
        v-if="!searchQuery"
        type="button"
        class="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
        @click="emit('add')"
      >
        + Add First Department
      </button>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="dept in filteredDepartments"
        :key="dept.id"
        class="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
        @click="emit('drillDown', dept.id)"
      >
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5">
              <span
                class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider"
                :class="getDepartmentColorClass(dept.color).badge"
              >
                {{ dept.code }}
              </span>
              <span class="text-xs text-slate-400 font-medium">ID: {{ dept.id }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1" @click.stop>
              <button
                type="button"
                class="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Edit Department"
                @click="emit('edit', dept)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Delete Department"
                @click="emit('delete', dept)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {{ dept.name }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {{ dept.description || `Core organizational team for ${dept.name}.` }}
          </p>
        </div>

        <!-- Footer -->
        <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3 text-xs">
            <span class="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <svg class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {{ adminStore.getUsersByDepartment(dept.id).length }} Members
            </span>

            <span class="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <svg class="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
              {{ adminStore.getTasksByDepartment(dept.id).length }} Tasks
            </span>
          </div>

          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition">
            View Team &rarr;
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
              <th class="py-4 px-6">Department Name</th>
              <th class="py-4 px-4">Code Tag</th>
              <th class="py-4 px-4">Personnel</th>
              <th class="py-4 px-4">Active Tasks</th>
              <th class="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <tr
              v-for="dept in filteredDepartments"
              :key="dept.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
              @click="emit('drillDown', dept.id)"
            >
              <td class="py-4 px-6">
                <div class="font-bold text-slate-900 dark:text-white">{{ dept.name }}</div>
                <div class="text-xs text-slate-400">ID: {{ dept.id }}</div>
              </td>
              <td class="py-4 px-4">
                <span class="px-2 py-0.5 rounded-lg text-xs font-mono font-bold" :class="getDepartmentColorClass(dept.color).badge">
                  {{ dept.code }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  {{ adminStore.getUsersByDepartment(dept.id).length }} team members
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  {{ adminStore.getTasksByDepartment(dept.id).length }} tasks
                </span>
              </td>
              <td class="py-4 px-6 text-right" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 transition"
                    @click="emit('drillDown', dept.id)"
                  >
                    View Team
                  </button>
                  <button
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Edit Department"
                    @click="emit('edit', dept)"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Delete Department"
                    @click="emit('delete', dept)"
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
