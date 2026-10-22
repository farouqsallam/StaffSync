<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  (e: 'success', data: any): void
}>()

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const successMessage = ref<string | null>(null)

// Setup Vee-Validate
const { handleSubmit } = useForm()

const { value: username, errorMessage: usernameError } = useField<string>(
  'username',
  'required|min:3',
)

const { value: password, errorMessage: passwordError } = useField<string>(
  'password',
  'required|min:4',
)

const onSubmit = handleSubmit(async (values) => {
  successMessage.value = null

  try {
    const data = await authStore.login({
      username: values.username,
      password: values.password,
    })

    successMessage.value = 'Login successful!'
    emit('success', data)

    if (authStore.isAdmin) {
      router.push('/admin')
    } else if (authStore.isEmployee) {
      router.push('/employee')
    }
  } catch {
    // Error is captured and managed in authStore.error
  }
})
</script>

<template>
  <div class="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)]">
    <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 sm:p-10 md:p-12 transition-all">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-10">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign In
        </h2>
        <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
          Access your StaffSync account
        </p>
      </div>

      <!-- Success Alert -->
      <div
        v-if="successMessage"
        class="flex items-center gap-3 p-4 mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-medium animate-fade-in"
      >
        <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span class="flex-1">{{ successMessage }}</span>
      </div>

      <!-- Error Alert -->
      <div
        v-if="authStore.error"
        class="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm animate-fade-in"
      >
        <svg class="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span class="flex-1 text-xs sm:text-sm leading-relaxed">{{ authStore.error }}</span>
        <button
          type="button"
          class="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 text-lg leading-none p-0.5 ml-1 transition"
          @click="authStore.clearError()"
        >
          &times;
        </button>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
        <!-- Username field -->
        <div class="flex flex-col gap-2">
          <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Username
          </label>
          <div
            class="relative flex items-center rounded-xl border bg-slate-50/70 dark:bg-slate-800/50 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
            :class="usernameError ? 'border-rose-400 dark:border-rose-500 focus-within:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'"
          >
            <svg class="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              autocomplete="username"
              class="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>
          <p v-if="usernameError" class="text-xs font-medium text-rose-500 mt-1">
            {{ usernameError }}
          </p>
        </div>

        <!-- Password field -->
        <div class="flex flex-col gap-2">
          <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Password
          </label>
          <div
            class="relative flex items-center rounded-xl border bg-slate-50/70 dark:bg-slate-800/50 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
            :class="passwordError ? 'border-rose-400 dark:border-rose-500 focus-within:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'"
          >
            <svg class="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              class="w-full pl-11 pr-11 py-3.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
            <button
              type="button"
              class="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              @click="showPassword = !showPassword"
              title="Toggle visibility"
            >
              <svg v-if="showPassword" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <p v-if="passwordError" class="text-xs font-medium text-rose-500 mt-1">
            {{ passwordError }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full mt-2 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-semibold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="authStore.isLoading"
        >
          <span
            v-if="authStore.isLoading"
            class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>
          <span>{{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
