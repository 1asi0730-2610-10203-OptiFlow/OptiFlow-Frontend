export default [
    {
        path: '/settings',
        name: 'settings',
        component: () => import('./views/settings-view.vue'),
        meta: { title: 'Configuración' }
    }
]
