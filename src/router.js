import { createRouter, createWebHistory } from 'vue-router'
import { pinia } from './pinia.js'
import { useAuthStore } from './iam/application/auth.store.js'
import iamRoutes          from './iam/presentation/iam-routes.js'
import dashboardRoutes    from './dashboard/presentation/dashboard-routes.js'
import clinicalRoutes     from "./clinical/presentation/clinical-routes.js";
import salesRoutes        from './sales/presentation/sales-routes.js'
import fulfillmentRoutes  from './fulfillment/presentation/fulfillment-routes.js'
import inventoryRoutes    from './inventory/presentation/inventory-routes.js'
import staffRoutes        from './staff/presentation/staff-routes.js'
import patientRoutes     from './patient-center/presentation/patient-routes.js'
import reportRoutes      from './report/presentation/report-routes.js'
import settingsRoutes    from './settings/presentation/settings-routes.js'
import subscriptionRoutes from './subscription/presentation/subscription-routes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',       redirect: '/login' },
    ...iamRoutes,
    ...dashboardRoutes,
    ...salesRoutes,
    ...fulfillmentRoutes,
    ...inventoryRoutes,
    ...clinicalRoutes,
    ...staffRoutes,
    ...patientRoutes,
    ...reportRoutes,
    ...settingsRoutes,
    ...subscriptionRoutes,
    {
      path:      '/:pathMatch(.*)*',
      name:      'not-found',
      component: () => import('./shared/presentation/views/page-not-found.vue')
    }
  ]
})

async function homePath(authStore) {
  if (authStore.isClient) return '/patient/my-lenses'
  if (authStore.subscriptionActive === null) await authStore.refreshSubscription()
  return authStore.subscriptionActive ? '/panel' : '/select-plan'
}

router.beforeEach(async (to) => {
  document.title = to.meta.title ? `${to.meta.title} — OptiFlow` : 'OptiFlow'

  // Pasar la instancia de pinia explícitamente para evitar errores de "no active Pinia"
  const authStore = useAuthStore(pinia)

  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublic = publicPaths.includes(to.path) || to.path === '/'
  const isPatientRoute = to.path.startsWith('/patient/')

  if (!isPublic && !isPatientRoute && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!authStore.isAuthenticated) return

  if (to.meta.guestOnly) {
    return { path: await homePath(authStore) }
  }

  // Clients live in the patient portal only (plus their own profile).
  if (authStore.isClient) {
    if (!isPatientRoute && to.path !== '/profile') {
      return { path: '/patient/my-lenses' }
    }
    return
  }

  // Admins must have an active subscription before reaching the dashboard.
  const subscriptionExempt =
    isPatientRoute || to.path === '/select-plan' || to.path === '/payment-success' || to.path === '/profile'
  if (!subscriptionExempt) {
    if (authStore.subscriptionActive === null) await authStore.refreshSubscription()
    if (!authStore.subscriptionActive) return { path: '/select-plan' }
  }
})

export default router

