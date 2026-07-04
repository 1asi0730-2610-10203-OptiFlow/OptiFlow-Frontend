export default [
  {
    path: '/select-plan',
    name: 'select-plan',
    component: () => import('./views/select-plan-view.vue'),
    meta: { title: 'Elige tu plan', requiresAuth: true }
  }
]
