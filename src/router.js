/**
 * Application router configuration.
 * Registers all bounded-context route modules and applies a global
 * navigation guard that sets the browser tab title via i18n keys.
 *
 * Registered bounded contexts:
 *   - Sales       → /sales
 *   - Fulfillment → /lab-orders
 *   - Inventory   → /inventory
 *   - Subscription → /subscription/*
 *
 * @module router
 */

import { createRouter, createWebHistory } from 'vue-router'
import dashboardRoutes    from './dashboard/presentation/dashboard-routes.js'
import clinicalRoutes     from "./clinical/presentation/clinical-routes.js";
import salesRoutes        from './sales/presentation/sales-routes.js'
import fulfillmentRoutes  from './fulfillment/presentation/fulfillment-routes.js'
import inventoryRoutes    from './inventory/presentation/inventory-routes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/panel' },
    ...dashboardRoutes,
    ...salesRoutes,
    ...fulfillmentRoutes,
    ...inventoryRoutes,
    ...clinicalRoutes,
    {
      path:      '/:pathMatch(.*)*',
      name:      'not-found',
      component: () => import('./shared/presentation/views/page-not-found.vue')
    }
  ]
})

/**
 * Global navigation guard.
 * Updates the document title before each route transition.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 */
router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — OptiFlow` : 'OptiFlow'
})

export default router