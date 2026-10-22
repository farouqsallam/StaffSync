<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          StaffSync
        </span>
      </div>

      <!-- Right Header Actions (When Authenticated) -->
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
        <span
          v-if="authStore.isAdmin"
          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          ROLE_ADMIN
        </span>
        <span
          v-else-if="authStore.isEmployee"
          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          ROLE_EMPLOYEE
        </span>
        <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span class="font-medium">{{ authStore.user?.username || 'User' }}</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
  </div>
</template>
