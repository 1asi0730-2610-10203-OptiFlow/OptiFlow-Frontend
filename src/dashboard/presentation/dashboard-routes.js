export default [
  {
    path: '/panel',
    name: 'dashboard',
    component: () => import('../../../../../promt/files/OptiFlow-Frontend/src/dashboard/presentation/views/dashboard-view.vue'),
    meta: { title: 'Panel de Control' }
  }
]
