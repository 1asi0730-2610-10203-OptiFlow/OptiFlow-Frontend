export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/login-view.vue'),
    meta: { title: 'Iniciar Sesión', requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('./views/register-view.vue'),
    meta: { title: 'Crear Cuenta', requiresAuth: false, guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('./views/forgot-password-view.vue'),
    meta: { title: 'Recuperar Contraseña', requiresAuth: false, guestOnly: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('./views/reset-password-view.vue'),
    meta: { title: 'Nueva Contraseña', requiresAuth: false, guestOnly: true }
  },
  {
    path: '/profile',
    name: 'user-profile',
    component: () => import('./views/profile-view.vue'),
    meta: { title: 'Mi Perfil', requiresAuth: true }
  }
]
