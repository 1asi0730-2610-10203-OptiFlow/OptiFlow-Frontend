import { createRouter, createWebHistory } from 'vue-router'
import salesRoutes from './sales/presentation/sales-routes.js'
import fulfillmentRoutes from './fulfillment/presentation/fulfillment-routes.js'
import inventoryRoutes from "./inventory/presentation/inventory-routes.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/sales' },
    ...salesRoutes,
    ...fulfillmentRoutes,
    ...inventoryRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./shared/presentation/views/page-not-found.vue')
    }
  ]
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — OptiFlow` : 'OptiFlow'
})

export default router
