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
    {
      path:      '/:pathMatch(.*)*',
      name:      'not-found',
      component: () => import('./shared/presentation/views/page-not-found.vue')
    }
  ]
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — OptiFlow` : 'OptiFlow'

  // Pasar la instancia de pinia explícitamente para evitar errores de "no active Pinia"
  const authStore = useAuthStore(pinia)

  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublic = publicPaths.includes(to.path) || to.path === '/'
  const isPatientRoute = to.path.startsWith('/patient/')

  if (!isPublic && !isPatientRoute && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: '/panel' }
  }
})

export default router

