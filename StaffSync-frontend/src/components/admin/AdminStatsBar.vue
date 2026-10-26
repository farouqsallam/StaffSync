<script setup lang="ts">
import { useAdminDataStore } from '@/stores/adminData'

const adminStore = useAdminDataStore()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
    <!-- Card 1: Departments -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Departments</span>
        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
      </div>
      <div class="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.totalDepartments }}</span>
        <span class="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Units</span>
      </div>
      <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">Cross-functional teams</p>
    </div>

    <!-- Card 2: Total Personnel -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Personnel</span>
        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      </div>
      <div class="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.totalUsers }}</span>
        <span class="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">Registered</span>
      </div>
      <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">Across all departments</p>
    </div>

    <!-- Card 3: Active Objectives -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Tasks & Goals</span>
        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 14 14" />
          </svg>
        </div>
      </div>
      <div class="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.totalTasks }}</span>
        <span class="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">{{ adminStore.pendingTasksCount }} open</span>
      </div>
      <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">Tracked deliverables</p>
    </div>

    <!-- Card 4: Completion Index -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Completion Rate</span>
        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      </div>
      <div class="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.completionRate }}%</span>
        <span class="text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400">Overall</span>
      </div>
      <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
        {{ adminStore.completedTasksCount }}/{{ adminStore.totalTasks }} finished
      </p>
    </div>
  </div>
</template>
