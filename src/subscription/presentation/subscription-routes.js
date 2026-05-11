/**
 * Vue Router route definitions for the Subscription bounded context.
 *
 * Routes:
 *   /subscription/success   — Post-payment landing page (Stripe redirect target).
 *   /subscription/my-plan   — Active plan management view.
 *
 * @module subscription-routes
 */

export default [
    {
        path:      '/subscription/success',
        name:      'subscription-success',
        component: () => import('./views/subscription-success.vue'),
        meta:      { title: 'subscription.meta.success' }
    },
    {
        path:      '/subscription/my-plan',
        name:      'subscription-my-plan',
        component: () => import('./views/my-plan.vue'),
        meta:      { title: 'subscription.meta.myPlan' }
    }
]