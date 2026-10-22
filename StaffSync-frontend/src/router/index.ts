import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    component: () => import('../components/Login.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('../components/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/employee',
    name: 'employee-dashboard',
    component: () => import('../components/EmployeeDashboard.vue'),
    meta: { requiresAuth: true, requiresEmployee: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Guard for any protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // Guard ensuring user has ROLE_ADMIN
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'login' })
    return
  }

  // Guard ensuring user has ROLE_EMPLOYEE (or ROLE_ADMIN)
  if (to.meta.requiresEmployee && !authStore.isEmployee && !authStore.isAdmin) {
    next({ name: 'login' })
    return
  }

  // If already logged in and visiting login page, redirect according to role
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next({ name: 'admin-dashboard' })
      return
    }
    if (authStore.isEmployee) {
      next({ name: 'employee-dashboard' })
      return
    }
  }

  next()
})

export default router
