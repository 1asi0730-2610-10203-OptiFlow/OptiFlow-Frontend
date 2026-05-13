import { createRouter, createWebHistory } from 'vue-router'
import dashboardRoutes    from './dashboard/presentation/dashboard-routes.js'
import clinicalRoutes     from "./clinical/presentation/clinical-routes.js";
import salesRoutes        from './sales/presentation/sales-routes.js'
import fulfillmentRoutes  from './fulfillment/presentation/fulfillment-routes.js'
import inventoryRoutes    from './inventory/presentation/inventory-routes.js'
import staffRoutes        from './staff/presentation/staff-routes.js'
import patientRoutes     from './patient-center/presentation/patient-routes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',       redirect: '/login' },
    { path: '/login',  name: 'login', component: () => import('./shared/presentation/views/login.vue') },
    ...dashboardRoutes,
    ...salesRoutes,
    ...fulfillmentRoutes,
    ...inventoryRoutes,
    ...clinicalRoutes,
    ...staffRoutes,
    ...patientRoutes,
    {
      path:      '/:pathMatch(.*)*',
      name:      'not-found',
      component: () => import('./shared/presentation/views/page-not-found.vue')
    }
  ]
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — OptiFlow` : 'OptiFlow'
})

export default router
