export default [
    {
        path: '/patients',
        name: 'patients',
        component: () => import('./views/patient-list.vue'),
        meta: { title: 'Pacientes' }
    }
]
