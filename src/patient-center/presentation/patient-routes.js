export default [
    {
        path: '/patient/my-lenses',
        name: 'my-lenses',
        component: () => import('./views/my-lenses.vue'),
        meta: { title: 'Mis Lentes' }
    },
    {
        path: '/patient/virtual-try-on',
        name: 'virtual-try-on',
        component: () => import('./views/virtual-try-on.vue'),
        meta: { title: 'Probador Virtual' }
    },
    {
        path: '/patient/calculator',
        name: 'calculator',
        component: () => import('./views/calculator.vue'),
        meta: { title: 'Calculadora' }
    },
    {
        path: '/patient/notifications',
        name: 'notifications',
        component: () => import('./views/notifications.vue'),
        meta: { title: 'Notificaciones' }
    }
]
