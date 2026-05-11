/**
 * Application service store for the Subscription bounded context.
 * It coordinates subscription use cases and exposes UI-facing state.
 *
 * @module useSubscriptionStore
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SubscriptionApi } from '../infrastructure/subscription-api.js'
import { SubscriptionAssembler } from '../infrastructure/subscription.assembler.js'
import { Subscription } from '../domain/model/subscription.entity.js'

const subscriptionApi = new SubscriptionApi()

/**
 * Reactive store that exposes Subscription commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
export const useSubscriptionStore = defineStore('subscription', () => {
    /**
     * All subscription records loaded from the API.
     * @type {import('vue').Ref<Subscription[]>}
     */
    const subscriptions = ref([])

    /**
     * The current user's most recent active subscription, if any.
     * @type {import('vue').Ref<Subscription|null>}
     */
    const currentSubscription = ref(null)

    /**
     * Whether an async operation is in progress.
     * @type {import('vue').Ref<boolean>}
     */
    const loading = ref(false)

    /**
     * Whether subscriptions have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const subscriptionsLoaded = ref(false)

    /**
     * Errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([])

    /**
     * Whether the current user holds an active subscription.
     * @type {import('vue').ComputedRef<boolean>}
     */
    const hasActiveSubscription = computed(() =>
        currentSubscription.value?.isActive ?? false
    )

    /**
     * Display name of the current plan, or null if none exists.
     * @type {import('vue').ComputedRef<string|null>}
     */
    const activePlanName = computed(() =>
        currentSubscription.value?.planName ?? null
    )

    /**
     * Loads all subscription records from infrastructure.
     * Sets subscriptionsLoaded to true on success.
     * @returns {void}
     */
    function fetchAll() {
        loading.value = true
        subscriptionApi.getAll()
            .then(response => {
                subscriptions.value = SubscriptionAssembler.toEntitiesFromResponse(response)
                subscriptionsLoaded.value = true
                console.log(`Loaded ${subscriptions.value.length} subscriptions.`)
                errors.value = []
            })
            .catch(error => {
                console.error('Error fetching subscriptions:', error)
                errors.value.push(error)
            })
            .finally(() => { loading.value = false })
    }

    /**
     * Loads subscriptions filtered by user ID and resolves the active one.
     * @param {string} userId - Owner user identifier.
     * @returns {void}
     */
    function fetchByUserId(userId) {
        loading.value = true
        subscriptionApi.getByUserId(userId)
            .then(response => {
                const list = SubscriptionAssembler.toEntitiesFromResponse(response)
                currentSubscription.value = list.find(s => s.isActive) ?? list[0] ?? null
                errors.value = []
            })
            .catch(error => {
                console.error('Error fetching user subscription:', error)
                errors.value.push(error)
            })
            .finally(() => { loading.value = false })
    }

    /**
     * Registers a new subscription after a successful Stripe Checkout redirect.
     * Builds the entity from the query-string parameters Stripe appends to the
     * success URL and persists it via the API.
     *
     * @param {string} sessionId  - Stripe Checkout session ID (cs_test_xxx).
     * @param {string} planId     - Plan key (basic | pro | enterprise).
     * @param {string} planName   - Human-readable plan name.
     * @param {string|number} price - Plan monthly price in USD.
     * @returns {Promise<Subscription>} The persisted entity.
     */
    function registerAfterPayment(sessionId, planId, planName, price) {
        loading.value = true

        const now       = new Date()
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)

        const subscription = new Subscription({
            userId:          import.meta.env.VITE_DEFAULT_USER_ID ?? 'current-user',
            planId,
            planName,
            price:           Number(price),
            currency:        'USD',
            status:          'active',
            stripeSessionId: sessionId,
            startDate:       now.toISOString(),
            endDate:         nextMonth.toISOString()
        })

        return subscriptionApi.create(subscription)
            .then(response => {
                const created = SubscriptionAssembler.toEntityFromResponse(response)
                currentSubscription.value = created
                subscriptions.value.push(created)
                subscriptionsLoaded.value = true
                errors.value = []
                console.log(`Subscription registered: ${created.planName} (${created.stripeSessionId})`)
                return created
            })
            .catch(error => {
                console.error('Error registering subscription:', error)
                errors.value.push(error)
                throw error
            })
            .finally(() => { loading.value = false })
    }

    /**
     * Cancels a subscription by setting its status to "cancelled".
     * Updates the local entity in place without re-fetching from the API.
     *
     * @param {number} id - Subscription identifier.
     * @returns {void}
     */
    function cancelSubscription(id) {
        loading.value = true
        subscriptionApi.cancel(id)
            .then(() => {
                if (currentSubscription.value?.id === id) {
                    currentSubscription.value.status = 'cancelled'
                }
                const index = subscriptions.value.findIndex(s => s.id === id)
                if (index !== -1) subscriptions.value[index].status = 'cancelled'
                console.log(`Subscription ${id} cancelled.`)
            })
            .catch(error => {
                console.error('Error cancelling subscription:', error)
                errors.value.push(error)
            })
            .finally(() => { loading.value = false })
    }

    return {
        subscriptions,
        currentSubscription,
        loading,
        subscriptionsLoaded,
        errors,
        hasActiveSubscription,
        activePlanName,
        fetchAll,
        fetchByUserId,
        registerAfterPayment,
        cancelSubscription
    }
})