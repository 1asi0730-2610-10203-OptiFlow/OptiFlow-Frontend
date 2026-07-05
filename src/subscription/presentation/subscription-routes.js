export default [
  {
    path: '/select-plan',
    name: 'select-plan',
    component: () => import('./views/select-plan-view.vue'),
    meta: { title: 'Elige tu plan', requiresAuth: true }
  },
  {
    path: '/payment-success',
    name: 'payment-success',
    component: () => import('./views/payment-success-view.vue'),
    meta: { title: 'Pago confirmado', requiresAuth: true }
  }
]
