export default [
  {
    path: '/staff',
    name: 'staff-list',
    component: () => import('./views/staff-list.vue'),
    meta: { title: 'Gestión de Personal' }
  }
]
