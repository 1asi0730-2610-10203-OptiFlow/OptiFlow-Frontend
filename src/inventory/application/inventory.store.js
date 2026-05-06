import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ProductApi } from '../infrastructure/product-api.js'
import { CategoryApi } from '../infrastructure/category-api.js'
import { SupplierApi } from '../infrastructure/supplier-api.js'
import { ProductAssembler } from '../infrastructure/product.assembler.js'
import { CategoryAssembler } from '../infrastructure/category.assembler.js'
import { SupplierAssembler } from '../infrastructure/supplier.assembler.js'

const productApi  = new ProductApi()
const categoryApi = new CategoryApi()
const supplierApi = new SupplierApi()

export const useInventoryStore = defineStore('inventory', () => {
    const productsRef   = ref([])
    const categoriesRef = ref([])
    const suppliersRef  = ref([])
    const loading = ref(false)
    const errors  = ref([])

    const products  = computed(() => productsRef.value)
    const categories = computed(() => categoriesRef.value)
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

    async function loadCategories() {
        loading.value = true
        try {
            const resources = await categoryApi.getCategories()
            categoriesRef.value = CategoryAssembler.toEntitiesFromResponse(resources)
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
            const resource = ProductAssembler.toResourceFromEntity(product)
            const updated = await productApi.updateProduct(resource)
            const entity = ProductAssembler.toEntityFromResource(updated)
            const index = productsRef.value.findIndex(p => p.id === product.id)
            if (index !== -1) productsRef.value[index] = entity
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
        } catch (e) {
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    return {
        products, categories, suppliers, lowStockProducts, loading, errors,
        loadProducts, loadCategories, loadSuppliers,
        createProduct, updateProduct, deleteProduct
    }
})