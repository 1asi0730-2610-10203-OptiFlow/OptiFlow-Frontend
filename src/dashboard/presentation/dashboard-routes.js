export default [
  {
    path: '/panel',
    name: 'dashboard',
    component: () => import('./views/dashboard-view.vue'),
    meta: { title: 'Panel de Control' }
  }
]
