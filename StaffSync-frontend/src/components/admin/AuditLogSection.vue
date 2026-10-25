<script setup lang="ts">
import { useAdminDataStore } from '@/stores/adminData'

const adminStore = useAdminDataStore()
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            Administrative Audit Trail
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Live chronological record of organizational updates, member additions, and task status shifts.
          </p>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Live Feed
        </span>
      </div>

      <div v-if="adminStore.activityLogs.length === 0" class="py-12 text-center text-slate-400 text-sm">
        No administrative actions recorded yet in this session.
      </div>

      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
        <div
          v-for="log in adminStore.activityLogs"
          :key="log.id"
          class="py-3.5 flex items-start gap-3.5"
        >
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            :class="{
              'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400': log.type === 'department',
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': log.type === 'user',
              'bg-amber-500/10 text-amber-600 dark:text-amber-400': log.type === 'task',
              'bg-slate-500/10 text-slate-600 dark:text-slate-400': log.type === 'system',
            }"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 dark:text-slate-200">{{ log.action }}</span>
              <span class="text-[11px] text-slate-400 font-mono">{{ log.timestamp }}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ log.target }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
