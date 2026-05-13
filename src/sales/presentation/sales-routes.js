export default [
  {
    path: '/sales',
    name: 'sale-list',
    component: () => import('./views/sale-list.vue'),
    meta: { title: 'Gestión de Ventas' }
  }
]
