/**
 * Infrastructure API client for the Subscription bounded context.
 * Extends BaseApi to obtain the configured Axios instance and exposes
 * CRUD operations for the /subscriptions REST resource.
 *
 * Endpoint path is read from the VITE_SUBSCRIPTIONS_ENDPOINT_PATH
 * environment variable (default: /subscriptions).
 *
 * @module subscription-api
 */

import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { SubscriptionAssembler } from './subscription.assembler.js'

export class SubscriptionApi extends BaseApi {
    /** @type {string} REST resource path resolved from the environment. */
    #endpoint = import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH ?? '/subscriptions'

    /**
     * Fetches all subscription records.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getAll() {
        return this.http.get(this.#endpoint)
    }

    /**
     * Fetches all subscriptions belonging to a specific user.
     * @param {string} userId - Owner user identifier.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getByUserId(userId) {
        return this.http.get(this.#endpoint, { params: { userId } })
    }

    /**
     * Fetches a single subscription by its identifier.
     * @param {number} id - Subscription identifier.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getById(id) {
        return this.http.get(`${this.#endpoint}/${id}`)
    }

    /**
     * Persists a new subscription record.
     * @param {import('../domain/model/subscription.entity.js').Subscription} subscription - Entity to persist.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    create(subscription) {
        const resource = SubscriptionAssembler.toResource(subscription)
        return this.http.post(this.#endpoint, resource)
    }

    /**
     * Replaces an existing subscription record.
     * @param {number} id - Subscription identifier.
     * @param {import('../domain/model/subscription.entity.js').Subscription} subscription - Updated entity.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    update(id, subscription) {
        const resource = SubscriptionAssembler.toResource(subscription)
        return this.http.put(`${this.#endpoint}/${id}`, resource)
    }

    /**
     * Sets a subscription's status to "cancelled" via a PATCH request.
     * @param {number} id - Subscription identifier.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    cancel(id) {
        return this.http.patch(`${this.#endpoint}/${id}`, { status: 'cancelled' })
    }
}