<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAdminDataStore, type AdminTask } from '@/stores/adminData'

const props = defineProps<{
  isOpen: boolean
  taskToEdit: AdminTask | null
  defaultUserId?: string | number
  defaultDepartmentId?: string | number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: {
      title: string
      description: string
      status: string
      priority: string
      dueDate: string
      assignedTo: (string | number)[]
    },
  ): void
}>()

const adminStore = useAdminDataStore()

const form = ref<{
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  selectedUserId: string | number
}>({
  title: '',
  description: '',
  status: 'Todo',
  priority: 'Medium',
  dueDate: '',
  selectedUserId: '',
})

watch(
  () => [props.taskToEdit, props.defaultUserId, props.isOpen],
  () => {
    if (props.taskToEdit) {
      const firstAssignee =
        props.taskToEdit.assignedTo && props.taskToEdit.assignedTo.length > 0
          ? props.taskToEdit.assignedTo[0]
          : props.taskToEdit.userId || ''

      form.value = {
        title: props.taskToEdit.title,
        description: props.taskToEdit.description,
        status: props.taskToEdit.status,
        priority: props.taskToEdit.priority,
        dueDate: props.taskToEdit.dueDate || '',
        selectedUserId: firstAssignee || '',
      }
    } else {
      const defaultAssignee =
        props.defaultUserId || adminStore.users[0]?.id || ''

      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 7)
      const dateString = defaultDate.toISOString().split('T')[0] ?? ''

      form.value = {
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        dueDate: dateString,
        selectedUserId: defaultAssignee,
      }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!form.value.title.trim()) return

  const assignedToIds: (string | number)[] = form.value.selectedUserId
    ? [form.value.selectedUserId]
    : []

  emit('save', {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    status: form.value.status,
    priority: form.value.priority,
    dueDate: form.value.dueDate,
    assignedTo: assignedToIds,
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
      class="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-thin"
    >
      <!-- Header -->
      <div class="flex items-start xs:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {{ taskToEdit ? 'Edit Task Assignment' : 'Create & Assign Task' }}
            </h2>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Set deliverables, assign personnel, and target delivery deadline
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
        <!-- Title -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Task Title / Objective *
          </label>
          <input
            v-model="form.title"
            required
            type="text"
            placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Description & Context
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Provide context, acceptance criteria, or relevant technical references..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
          ></textarea>
        </div>

        <!-- Assignee (assignedTo) -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Assigned Personnel (assignedTo) *
          </label>
          <select
            v-model="form.selectedUserId"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="" disabled>Select Team Member</option>
            <option
              v-for="u in adminStore.users"
              :key="u.id"
              :value="u.id"
            >
              {{ u.name }} ({{ u.role }}) - {{ u.email }}
            </option>
          </select>
        </div>

        <!-- Priority & Status & Due Date -->
        <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <!-- Priority (Low, Medium, High) -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              v-model="form.priority"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              v-model="form.status"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <!-- Due Date -->
          <div class="xs:col-span-2 sm:col-span-1">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Target Deadline
            </label>
            <input
              v-model="form.dueDate"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
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
            class="w-full xs:w-auto text-center justify-center px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-sm font-semibold text-white shadow-md shadow-amber-600/25 transition active:scale-95"
          >
            {{ taskToEdit ? 'Save Changes' : 'Assign Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
