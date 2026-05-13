import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MaterialApi } from '../infrastructure/material-api.js'
import { MaterialAssembler } from '../infrastructure/material.assembler.js'

const materialApi = new MaterialApi()

export const useCalculatorStore = defineStore('calculator', () => {
    const materials = ref([])
    const loading = ref(false)

    async function loadMaterials() {
        loading.value = true
        try {
            const resources = await materialApi.getMaterials()
            materials.value = MaterialAssembler.toEntitiesFromResponse(resources)
        } catch (e) {
            console.error("Error cargando materiales:", e)
        } finally {
            loading.value = false
        }
    }

    return { materials, loading, loadMaterials }
})
