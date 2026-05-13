export default [
    {
        path: '/inventory',
        name: 'inventory',
        component: () => import('./views/inventory-list.vue'),
        meta: { title: 'Inventario' }
    }
]