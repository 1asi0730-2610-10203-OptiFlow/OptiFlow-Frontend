import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ProductApi } from '../infrastructure/product-api.js'
import { SupplierApi } from '../infrastructure/supplier-api.js'
import { ProductAssembler } from '../infrastructure/product.assembler.js'
import { SupplierAssembler } from '../infrastructure/supplier.assembler.js'
import { eventBus } from '../../shared/infrastructure/event-bus.js'
import { InventoryEvents } from '../domain/events/inventory-events.js'

const productApi  = new ProductApi()
const supplierApi = new SupplierApi()

export const useInventoryStore = defineStore('inventory', () => {
    const productsRef   = ref([])
    const suppliersRef  = ref([])
    const loading = ref(false)
    const errors  = ref([])

    const products  = computed(() => productsRef.value)
    const suppliers  = computed(() => suppliersRef.value)
    const lowStockProducts = computed(() =>
        productsRef.value.filter(p => p.stock <= 3)
    )

    async function loadProducts() {
        loading.value = true
        try {
            const resources = await productApi.getProducts()
            productsRef.value = ProductAssembler.toEntitiesFromResponse(resources)
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function loadSuppliers() {
        loading.value = true
        try {
            const resources = await supplierApi.getSuppliers()
            suppliersRef.value = SupplierAssembler.toEntitiesFromResponse(resources)
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function createProduct(product) {
        loading.value = true
        try {
            const resource = ProductAssembler.toResourceFromEntity(product)
            const created = await productApi.createProduct(resource)
            productsRef.value.unshift(ProductAssembler.toEntityFromResource(created))
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function updateProduct(product) {
        loading.value = true
        try {
            const payload = {
                name:                   product.name,
                sku:                    product.sku,
                category:               product.category,
                price:                  product.price,
                minimumStockThreshold:  product.minimumStockThreshold
            }
            const updated = await productApi.updateProduct(product.id, payload)
            const entity = ProductAssembler.toEntityFromResource(updated)
            const index = productsRef.value.findIndex(p => p.id === product.id)
            if (index !== -1) productsRef.value[index] = entity
            eventBus.emit(InventoryEvents.PRODUCT_UPDATED, { product: entity })
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function deleteProduct(id) {
        loading.value = true
        try {
            await productApi.deleteProduct(id)
            productsRef.value = productsRef.value.filter(p => p.id !== id)
            eventBus.emit(InventoryEvents.PRODUCT_DELETED, { id })
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function createProductFromResource(resource) {
        loading.value = true
        try {
            const created = await productApi.createProduct(resource)
            const entity = ProductAssembler.toEntityFromResource(created)
            productsRef.value.unshift(entity)
            eventBus.emit(InventoryEvents.PRODUCT_CREATED, { product: entity })
        } catch (e) {
            const data = e.response?.data
            let message = e.message
            if (data?.errors) message = Object.values(data.errors).flat().join(' ')
            else if (data?.detail) message = data.detail
            else if (typeof data === 'string' && data) message = data
            errors.value.push(message)
            eventBus.emit(InventoryEvents.PRODUCT_CREATE_FAILED, { message })
        } finally {
            loading.value = false
        }
    }

    async function restock(id, qty, operation) {
        const index = productsRef.value.findIndex(p => p.id === id)
        if (index === -1) return
        try {
            // TODO: replace with the signed-in user's name once real auth/session exists.
            const updated = await productApi.restockProduct(id, qty, 'Sistema')
            const entity = ProductAssembler.toEntityFromResource(updated)
            productsRef.value[index] = entity
            eventBus.emit(InventoryEvents.STOCK_RESTOCKED, { product: entity, qty, operation })
            if (entity.stock <= entity.minimumStockThreshold) {
                eventBus.emit(InventoryEvents.STOCK_LOW_ALERT, { product: entity })
            }
        } catch (e) {
            errors.value.push(e.message)
        }
    }

    return {
        products, suppliers, lowStockProducts, loading, errors,
        loadProducts, loadSuppliers,
        createProduct, updateProduct, deleteProduct, createProductFromResource, restock
    }


})