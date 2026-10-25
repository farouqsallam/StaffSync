<script setup lang="ts">
import { useAdminDataStore } from '@/stores/adminData'

const adminStore = useAdminDataStore()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
    <!-- Card 1: Departments -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Departments</span>
        <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.totalDepartments }}</span>
        <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Units</span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Cross-functional business teams</p>
    </div>

    <!-- Card 2: Total Personnel -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Personnel</span>
        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.totalUsers }}</span>
        <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Registered</span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Assigned across all departments</p>
    </div>

    <!-- Card 3: Active Objectives -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Objectives</span>
        <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 14 14" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.totalTasks }}</span>
        <span class="text-xs font-medium text-amber-600 dark:text-amber-400">{{ adminStore.pendingTasksCount }} pending</span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Tracked tasks and deliverables</p>
    </div>

    <!-- Card 4: Completion Index -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completion Index</span>
        <div class="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-slate-900 dark:text-white">{{ adminStore.completionRate }}%</span>
        <span class="text-xs font-semibold text-teal-600 dark:text-teal-400">Overall</span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ adminStore.completedTasksCount }} finished of {{ adminStore.totalTasks }} total
      </p>
    </div>
  </div>
</template>
