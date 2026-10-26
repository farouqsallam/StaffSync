<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Department } from '@/stores/adminData'

const props = defineProps<{
  isOpen: boolean
  departmentToEdit: Department | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { name: string; code: string }): void
}>()

const form = ref<{
  name: string
  code: string
}>({
  name: '',
  code: '',
})

watch(
  () => [props.departmentToEdit, props.isOpen],
  () => {
    if (props.departmentToEdit) {
      form.value = {
        name: props.departmentToEdit.name,
        code: props.departmentToEdit.code,
      }
    } else {
      form.value = {
        name: '',
        code: '',
      }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!form.value.name.trim() || !form.value.code.trim()) return
  emit('save', {
    name: form.value.name.trim(),
    code: form.value.code.trim().toUpperCase(),
  })
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
    >
      <!-- Header -->
      <div class="flex items-start xs:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3h6v4H9z" />
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {{ departmentToEdit ? 'Edit Department' : 'Create New Department' }}
            </h2>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ departmentToEdit ? 'Update department name and code tag' : 'Define new organizational department unit' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          @click="emit('close')"
        >
          &times;
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mt-5 sm:mt-6 space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Department Name *
          </label>
          <input
            v-model="form.name"
            required
            type="text"
            placeholder="e.g. Engineering & Technology"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <!-- Code Tag -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Department Code *
          </label>
          <input
            v-model="form.code"
            required
            type="text"
            maxlength="10"
            placeholder="e.g. ENG"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white uppercase font-mono placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <p class="text-[11px] text-slate-400 mt-1">Short identifier code (max 10 characters, e.g. ENG, HR, OPS)</p>
        </div>

        <!-- Action Buttons -->
        <div class="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            class="w-full xs:w-auto text-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full xs:w-auto text-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition active:scale-95"
          >
            {{ departmentToEdit ? 'Save Changes' : 'Create Department' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
