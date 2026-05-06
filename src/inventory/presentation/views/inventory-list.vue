<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useInventoryStore } from '../../application/inventory.store.js'
import ModalAddProduct   from '../components/modal-add-product.vue'
import ModalRestock      from '../components/modal-restock.vue'
import ModalBulkRestock  from '../components/modal-bulk-restock.vue'
import ModalAuditLog     from '../components/modal-audit-log.vue'

const store = useInventoryStore()
const toast = useToast()

const busqueda = ref('')
const filtroCategoria = ref('Todas las Categorías')
const filtroNivel = ref('Todos los Niveles')
const showAgregar = ref(false)
const articuloRestock = ref(null)
const showRestockMasivo = ref(false)
const showAuditoria = ref(false)
const logsAuditoria = ref([])

const categorias = ['Todas las Categorías', 'Lunas', 'Armazones', 'Accesorios', 'Lentes de Contacto', 'Lentes de Sol', 'Equipos']
const nivelesStock = ['Todos los Niveles', 'Crítico', 'Stock Bajo', 'En Stock']

function estadoStock(stock, reorden) {
  const pct = (stock / reorden) * 100
  if (pct <= 50)  return { estado: 'critico', color: 'text--red' }
  if (pct <= 100) return { estado: 'bajo',    color: 'text--yellow' }
  return                 { estado: 'normal',  color: 'text--green' }
}

const resumen = computed(() => [
  {
    label: 'Total Artículos',
    value: String(store.products.reduce((s, i) => s + (i.stock || 0), 0)),
    icon: 'pi pi-box', trend: 'up', change: '+8%'
  },
  {
    label: 'Stock Bajo',
    value: String(store.products.filter(i => i.stock <= i.nivelReorden).length),
    icon: 'pi pi-exclamation-triangle', trend: 'down',
    change: `${store.products.filter(i => i.stock <= i.nivelReorden).length} artículos`
  },
  {
    label: 'Valor Total',
    value: `S/ ${store.products.reduce((s, i) => s + (i.stock || 0) * (i.price || i.precioUnitario || 0), 0).toFixed(0)}`,
    icon: 'pi pi-chart-line', trend: 'up', change: '+12%'
  }
])

const hayFiltros = computed(() =>
    busqueda.value ||
    filtroCategoria.value !== 'Todas las Categorías' ||
    filtroNivel.value !== 'Todos los Niveles'
)

const filtrados = computed(() => {
  let list = store.products
  const q = busqueda.value.toLowerCase()
  if (q) list = list.filter(i =>
      (i.nombre || '').toLowerCase().includes(q) ||
      (i.sku || '').toLowerCase().includes(q) ||
      (i.categoria || '').toLowerCase().includes(q) ||
      (i.proveedor || '').toLowerCase().includes(q)
  )
  if (filtroCategoria.value !== 'Todas las Categorías')
    list = list.filter(i => i.categoria === filtroCategoria.value)
  if (filtroNivel.value !== 'Todos los Niveles') {
    list = list.filter(i => {
      const { estado } = estadoStock(i.stock, i.nivelReorden)
      if (filtroNivel.value === 'Crítico')   return estado === 'critico'
      if (filtroNivel.value === 'Stock Bajo') return estado === 'bajo'
      if (filtroNivel.value === 'En Stock')   return estado === 'normal'
      return true
    })
  }
  return list
})

const skusExistentes = computed(() => store.products.map(i => (i.sku || '').toUpperCase()))

onMounted(() => {
  store.loadProducts()
  store.loadCategories()
  store.loadSuppliers()
})

function limpiarFiltros() {
  busqueda.value = ''
  filtroCategoria.value = 'Todas las Categorías'
  filtroNivel.value = 'Todos los Niveles'
}

async function onAgregarArticulo(data) {
  await store.createProduct(data)
  showAgregar.value = false
  toast.add({ severity: 'success', summary: 'Artículo agregado', detail: `${data.nombre} registrado en el inventario.`, life: 2500 })
}

function onRestock({ id, qty, operacion }) {
  const articulo = store.products.find(i => i.id === id || i.product_id === id)
  if (!articulo) return
  const ahora = new Date()
  const fecha = ahora.toISOString().split('T')[0]
  const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  logsAuditoria.value.unshift({
    id: `LOG-${Date.now()}-${id}`,
    fecha, hora,
    autor: 'John Doe',
    articulo: articulo.nombre,
    sku: articulo.sku,
    cantidad: qty,
    operacion,
    stockAnterior: articulo.stock,
    stockNuevo: articulo.stock + qty
  })
  const index = store.products.findIndex(i => i.id === id || i.product_id === id)
  if (index !== -1) {
    store.products[index].stock += qty
    store.products[index].ultimoRestock = fecha
  }
  toast.add({ severity: 'success', summary: 'Restock registrado', detail: `+${qty} unidades agregadas.`, life: 2500 })
}
</script>

<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Gestión de Inventario</h1>
        <p class="page-subtitle">Control y seguimiento de niveles de stock</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="showAuditoria = true">
          <i class="pi pi-file-edit" /> <span>Ver Auditoría</span>
        </button>
        <button class="btn-secondary" @click="showRestockMasivo = true">
          <i class="pi pi-box" /> <span>Reabastecer</span>
        </button>
        <button class="btn-primary" @click="showAgregar = true">
          <i class="pi pi-plus" /> Agregar
        </button>
      </div>
    </div>

    <!-- Resumen -->
    <div class="summary-grid">
      <div v-for="s in resumen" :key="s.label" class="summary-card">
        <div class="summary-top">
          <div class="summary-icon">
            <i :class="s.icon" />
          </div>
          <div class="summary-trend" :class="s.trend === 'up' ? 'trend--up' : 'trend--neutral'">
            <i :class="s.trend === 'up' ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'" />
            <span>{{ s.change }}</span>
          </div>
        </div>
        <p class="summary-value">{{ s.value }}</p>
        <p class="summary-label">{{ s.label }}</p>
      </div>
    </div>

    <!-- Toolbar búsqueda -->
    <div class="toolbar">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" />
        <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            class="search-input"
        />
      </div>
      <div class="filter-wrapper">
        <select v-model="filtroCategoria" class="filter-select">
          <option v-for="c in categorias" :key="c">{{ c }}</option>
        </select>
        <i class="pi pi-chevron-down filter-arrow" />
      </div>
      <div class="filter-wrapper">
        <select v-model="filtroNivel" class="filter-select">
          <option v-for="n in nivelesStock" :key="n">{{ n }}</option>
        </select>
        <i class="pi pi-chevron-down filter-arrow" />
      </div>
      <button v-if="hayFiltros" class="btn-limpiar" @click="limpiarFiltros">Limpiar</button>
    </div>
    <p v-if="hayFiltros" class="filtros-activos">
      <strong>Filtros:</strong>
      {{ busqueda ? `"${busqueda}"` : '' }}
      {{ filtroCategoria !== 'Todas las Categorías' ? filtroCategoria : '' }}
      {{ filtroNivel !== 'Todos los Niveles' ? filtroNivel : '' }}
    </p>

    <!-- Tabla de inventario -->
    <div class="table-wrapper">
      <div class="table-header-row">
        <span>Producto</span>
        <span>Categoría</span>
        <span>Stock</span>
        <span class="text-right">Precio</span>
        <span>Proveedor</span>
        <span>Acciones</span>
      </div>

      <div v-if="filtrados.length === 0" class="table-empty">
        <div class="empty-icon"><i class="pi pi-box" /></div>
        <p class="empty-title">Inventario incompatible</p>
        <p class="empty-desc">No se encontraron artículos con los filtros seleccionados.</p>
        <button v-if="hayFiltros" class="btn-limpiar-empty" @click="limpiarFiltros">Limpiar filtros</button>
      </div>

      <div
          v-for="item in filtrados"
          :key="item.product_id || item.id"
          class="table-row"
      >
        <!-- Producto -->
        <div class="row-product">
          <div class="product-icon"><i class="pi pi-box" /></div>
          <div>
            <p class="product-name">{{ item.nombre }}</p>
            <span class="product-sku">{{ item.sku }}</span>
          </div>
        </div>

        <!-- Categoría -->
        <span class="category-chip">{{ item.categoria }}</span>

        <!-- Stock con barra -->
        <div class="stock-cell">
          <div class="stock-top">
            <i
                v-if="estadoStock(item.stock, item.nivelReorden).estado !== 'normal'"
                class="pi pi-exclamation-triangle"
                :class="estadoStock(item.stock, item.nivelReorden).color"
            />
            <span class="stock-value" :class="estadoStock(item.stock, item.nivelReorden).color">
              {{ item.stock }}
              <span class="stock-min">/ mín {{ item.nivelReorden }}</span>
            </span>
          </div>
          <div class="stock-bar">
            <div
                class="stock-fill"
                :class="`fill--${estadoStock(item.stock, item.nivelReorden).estado}`"
                :style="{ width: `${Math.min((item.stock / item.nivelReorden) * 100, 100)}%` }"
            />
          </div>
        </div>

        <!-- Precio -->
        <span class="text-right price-value">S/ {{ (item.price || 0).toFixed(2) }}</span>

        <!-- Proveedor -->
        <span class="proveedor-value">{{ item.proveedor }}</span>

        <!-- Acciones -->
        <div class="row-actions">
          <button class="btn-reponer" @click="articuloRestock = item">Reponer</button>
          <button class="btn-editar">Editar</button>
        </div>
      </div>

      <!-- Footer paginación -->
      <div class="table-footer">
        <span>Mostrando {{ filtrados.length }} de {{ store.products.length }} artículos</span>
        <div class="pagination">
          <button class="page-btn">Anterior</button>
          <button class="page-btn page-btn--active">1</button>
          <button class="page-btn">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ModalAddProduct
        v-if="showAgregar"
        :skus-existentes="skusExistentes"
        @save="onAgregarArticulo"
        @close="showAgregar = false"
    />
    <ModalRestock
        v-if="articuloRestock"
        :articulo="articuloRestock"
        @restock="onRestock"
        @close="articuloRestock = null"
    />
    <ModalBulkRestock
        v-if="showRestockMasivo"
        :articulos="store.products"
        @restock="onRestock"
        @close="showRestockMasivo = false"
    />
    <ModalAuditLog
        v-if="showAuditoria"
        :logs="logsAuditoria"
        @close="showAuditoria = false"
    />
  </div>
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; margin: 0; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; margin: 4px 0 0; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.btn-secondary { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 500; color: #374151; cursor: pointer; transition: background 0.15s; }
.btn-secondary:hover { background: #f9fafb; }
.btn-primary { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { opacity: 0.9; }

.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.summary-card { background: #fff; border-radius: 14px; padding: 18px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.summary-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.summary-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,193,176,0.1); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; }
.summary-trend { display: flex; align-items: center; gap: 4px; font-family: 'Montserrat', sans-serif; font-size: 0.76rem; font-weight: 600; }
.trend--up { color: #16a34a; }
.trend--neutral { color: #6b7280; }
.summary-value { font-family: 'Josefin Sans', sans-serif; font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0; }
.summary-label { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #6b7280; margin: 4px 0 0; }

.toolbar { background: #fff; border-radius: 12px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); padding: 12px 16px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.search-wrapper { flex: 1; min-width: 200px; position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.85rem; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; outline: none; color: #374151; }
.search-input:focus { border-color: #00c1b0; }
.filter-wrapper { position: relative; display: flex; align-items: center; }
.filter-select { appearance: none; -webkit-appearance: none; padding: 8px 32px 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #374151; background: #fff; outline: none; cursor: pointer; transition: border-color 0.15s; }
.filter-select:focus { border-color: #00c1b0; }
.filter-arrow { position: absolute; right: 10px; font-size: 0.7rem; color: #9ca3af; pointer-events: none; }
.btn-limpiar { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; padding: 7px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; cursor: pointer; }
.btn-limpiar:hover { background: #f9fafb; }
.filtros-activos { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: -8px 0 0; padding: 0 4px; }

.table-wrapper { background: #fff; border-radius: 14px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden; }
.table-header-row { display: grid; grid-template-columns: 1fr 110px 160px 90px 130px 130px; gap: 16px; padding: 10px 20px; background: #f9fafb; border-bottom: 1px solid #f3f4f6; font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.table-row { display: grid; grid-template-columns: 1fr 110px 160px 90px 130px 130px; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f9fafb; align-items: center; transition: background 0.1s; }
.table-row:hover { background: #f9fafb; }

.row-product { display: flex; align-items: center; gap: 10px; min-width: 0; }
.product-icon { width: 36px; height: 36px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; flex-shrink: 0; }
.product-name { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #111827; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-sku { font-family: 'Courier New', monospace; font-size: 0.74rem; color: #9ca3af; }

.category-chip { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: rgba(0,193,176,0.1); color: #00c1b0; white-space: nowrap; display: inline-flex; }

.stock-cell { display: flex; flex-direction: column; gap: 4px; }
.stock-top { display: flex; align-items: center; gap: 5px; }
.stock-value { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; }
.stock-min { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 400; color: #9ca3af; }
.stock-bar { width: 100%; background: #e5e7eb; border-radius: 4px; height: 5px; overflow: hidden; }
.stock-fill { height: 5px; border-radius: 4px; transition: width 0.3s; }
.fill--normal  { background: #22c55e; }
.fill--bajo    { background: #eab308; }
.fill--critico { background: #ef4444; }
.text--green  { color: #16a34a; }
.text--yellow { color: #ca8a04; }
.text--red    { color: #dc2626; }

.text-right { text-align: right; }
.price-value { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; text-align: right; }
.proveedor-value { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.row-actions { display: flex; gap: 6px; }
.btn-reponer { padding: 6px 12px; border: none; border-radius: 8px; background: #16a34a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.76rem; font-weight: 600; cursor: pointer; }
.btn-reponer:hover { opacity: 0.9; }
.btn-editar { padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151; font-family: 'Montserrat', sans-serif; font-size: 0.76rem; font-weight: 600; cursor: pointer; }
.btn-editar:hover { background: #f9fafb; }

.table-empty { padding: 64px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.empty-icon { width: 48px; height: 48px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 1.2rem; }
.empty-title { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #374151; margin: 0; }
.empty-desc { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #9ca3af; margin: 0; }
.btn-limpiar-empty { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 7px 14px; border: 1px solid #00c1b0; border-radius: 8px; background: #fff; color: #00c1b0; cursor: pointer; margin-top: 4px; }

.table-footer { padding: 12px 20px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.table-footer span { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.pagination { display: flex; gap: 6px; }
.page-btn { padding: 5px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; cursor: pointer; }
.page-btn:hover { background: #f9fafb; }
.page-btn--active { background: #00c1b0; color: #fff; border-color: #00c1b0; }
</style>