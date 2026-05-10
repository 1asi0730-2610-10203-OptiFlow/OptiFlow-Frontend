/**
 * Subscription entity representing a user's active plan in the OptiFlow ERP.
 * Belongs to the Subscription bounded context.
 *
 * @module subscription.entity
 */

/**
 * Represents a subscription record linked to a Stripe Checkout session.
 */
export class Subscription {
    /**
     * @param {Object}  [data={}]
     * @param {number}  [data.id=0]               - Persisted identifier.
     * @param {string}  [data.userId='']           - Owner user identifier.
     * @param {string}  [data.planId='']           - Plan key (basic | pro | enterprise).
     * @param {string}  [data.planName='']         - Human-readable plan label.
     * @param {number}  [data.price=0]             - Monthly price in USD.
     * @param {string}  [data.currency='USD']      - ISO currency code.
     * @param {string}  [data.status='active']     - Lifecycle status (active | cancelled).
     * @param {string}  [data.stripeSessionId='']  - Stripe Checkout session ID.
     * @param {string}  [data.startDate='']        - ISO 8601 subscription start date.
     * @param {string}  [data.endDate='']          - ISO 8601 next billing date.
     */
    constructor({
                    id              = 0,
                    userId          = '',
                    planId          = '',
                    planName        = '',
                    price           = 0,
                    currency        = 'USD',
                    status          = 'active',
                    stripeSessionId = '',
                    startDate       = '',
                    endDate         = ''
                } = {}) {
        this.id              = id
        this.userId          = userId
        this.planId          = planId
        this.planName        = planName
        this.price           = price
        this.currency        = currency
        this.status          = status
        this.stripeSessionId = stripeSessionId
        this.startDate       = startDate
        this.endDate         = endDate
    }

    /**
     * Whether this subscription is in an active lifecycle state.
     * @returns {boolean}
     */
    get isActive() {
        return this.status === 'active'
    }

    /**
     * Formatted monthly price string (e.g. "$29.99 USD").
     * The "/mo" suffix must be appended via i18n in the presentation layer.
     * @returns {string}
     */
    get formattedPrice() {
        return `$${Number(this.price).toFixed(2)} ${this.currency}`
    }
}

/**
 * Catalogue of available subscription plans.
 * Price IDs are read from environment variables — never hardcoded.
 * Set VITE_STRIPE_PRICE_BASIC, VITE_STRIPE_PRICE_PRO, VITE_STRIPE_PRICE_ENTERPRISE
 * in .env.development with real Stripe Price IDs (price_xxx) from the Dashboard.
 *
 * @readonly
 * @enum {{ id: string, planKey: string, price: number, stripePriceId: string }}
 */
export const SubscriptionPlan = Object.freeze({
    BASIC: {
        id:            'basic',
        planKey:       'basic',
        price:         9.99,
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_BASIC
    },
    PRO: {
        id:            'pro',
        planKey:       'pro',
        price:         29.99,
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_PRO
    },
    ENTERPRISE: {
        id:            'enterprise',
        planKey:       'enterprise',
        price:         79.99,
        stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE
    }
})