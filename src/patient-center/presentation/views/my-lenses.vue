<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '../../application/order.store.js'

const store = useOrderStore()
const orderQuery = ref('') 

const today = computed(() => new Date().toLocaleDateString('es-PE', { 
    day: 'numeric', month: 'long', year: 'numeric' 
}))

const orderFound = computed(() => store.currentOrder)

const searchOrder = async () => {
    await store.findOrder(orderQuery.value)
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Mis Lentes</h1>
      <p class="page-subtitle">Portal del Paciente · {{ today }}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="pi pi-shopping-bag" /></div>
        <div class="stat-value">{{ orderQuery || '---' }}</div>
        <div class="stat-label">Orden Consultada</div>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" />
        <input v-model="orderQuery" class="search-input" placeholder="Ej: LAB-2850" @keyup.enter="searchOrder" />
      </div>
      <button class="btn-primary" @click="searchOrder" :disabled="store.loading">
        {{ store.loading ? 'Buscando...' : 'Buscar Orden' }}
      </button>
    </div>

    <!-- Mostramos el resultado que viene de la Store -->
    <div class="table-wrapper" v-if="orderFound">
      <div class="table-header-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; padding: 10px 20px;">
        <span>PRODUCTO</span><span>CÓDIGO</span><span>ESTADO</span>
      </div>
      <div class="table-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; padding: 14px 20px;">
        <span class="patient-name">{{ orderFound.productName }}</span>
        <span class="row-dni">{{ orderFound.orderNumber }}</span>
        <div class="row-actions">
            <span style="background: #00c1b0; color: white; padding: 6px 12px; border-radius: 8px; font-family: 'Montserrat'; font-size: 0.75rem; font-weight: 600;">
                {{ orderFound.status }}
            </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.page-header { margin-bottom: 10px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-card { background: #fff; border-radius: 14px; padding: 18px; border: 1px solid #f3f4f6; }
.stat-icon { color: #00c1b0; margin-bottom: 8px; }
.stat-value { font-family: 'Josefin Sans'; font-size: 1.7rem; font-weight: 700; }
.toolbar { background: #fff; border-radius: 12px; border: 1px solid #f3f4f6; padding: 12px 16px; display: flex; gap: 10px; }
.search-wrapper { flex: 1; position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid #e5e7eb; border-radius: 8px; }
.btn-primary { padding: 9px 18px; background: #03070a; color: #fff; border-radius: 8px; font-weight: 600; cursor: pointer; }
.table-wrapper { background: #fff; border-radius: 14px; border: 1px solid #f3f4f6; margin-top: 20px; }
.table-header-row { background: #f9fafb; font-weight: 700; font-size: 0.7rem; color: #9ca3af; }
</style>
