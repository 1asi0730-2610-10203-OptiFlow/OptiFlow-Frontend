export default [
    {
        path: '/lab-orders',
        name: 'lab-orders',
        component: () => import('./views/lab-order-list.vue'),
        meta: { title: 'Órdenes de Lab' }
    }
]