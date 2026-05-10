/**
 * Assembler for the Subscription bounded context.
 * Converts raw API resources into domain entities and vice-versa,
 * keeping infrastructure concerns out of the domain layer.
 *
 * @module subscription.assembler
 */

import { Subscription } from '../domain/model/subscription.entity.js'

export class SubscriptionAssembler {
    /**
     * Converts a single API resource object into a Subscription entity.
     *
     * @param {Object} resource - Raw JSON object returned by the REST API.
     * @returns {Subscription} Hydrated entity.
     */
    static toEntityFromResource(resource) {
        return new Subscription({
            id:              resource.id,
            userId:          resource.userId,
            planId:          resource.planId,
            planName:        resource.planName,
            price:           resource.price,
            currency:        resource.currency  ?? 'USD',
            status:          resource.status,
            stripeSessionId: resource.stripeSessionId,
            startDate:       resource.startDate,
            endDate:         resource.endDate
        })
    }

    /**
     * Converts an Axios response whose data is an array of resources
     * into an array of Subscription entities.
     *
     * @param {import('axios').AxiosResponse} response - Axios response object.
     * @returns {Subscription[]} Array of entities (empty if data is not an array).
     */
    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response.data)) return []
        return response.data.map(r => SubscriptionAssembler.toEntityFromResource(r))
    }

    /**
     * Converts an Axios response whose data is a single resource
     * into a Subscription entity.
     *
     * @param {import('axios').AxiosResponse} response - Axios response object.
     * @returns {Subscription|null} Entity, or null if data is absent.
     */
    static toEntityFromResponse(response) {
        if (!response.data) return null
        return SubscriptionAssembler.toEntityFromResource(response.data)
    }

    /**
     * Serialises a Subscription entity into a plain resource object
     * suitable for POST / PUT requests.
     *
     * @param {Subscription} entity - Domain entity to serialise.
     * @returns {Object} Resource object without the `id` field.
     */
    static toResource(entity) {
        return {
            userId:          entity.userId,
            planId:          entity.planId,
            planName:        entity.planName,
            price:           entity.price,
            currency:        entity.currency,
            status:          entity.status,
            stripeSessionId: entity.stripeSessionId,
            startDate:       entity.startDate,
            endDate:         entity.endDate
        }
    }
}