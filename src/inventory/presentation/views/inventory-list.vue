<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import ContextMenu from 'primevue/contextmenu'
import { useInventoryStore } from '../../application/inventory.store.js'
import { eventBus } from '../../../shared/infrastructure/event-bus.js'
import { InventoryEvents } from '../../domain/events/inventory-events.js'
import ModalAddProduct        from '../components/modal-add-product.vue'
import ModalRestock           from '../components/modal-restock.vue'
import ModalBulkRestock       from '../components/modal-bulk-restock.vue'
import ModalAuditLog          from '../components/modal-audit-log.vue'
import ModalEditProduct       from '../components/modal-edit-product.vue'
import RegisterSupplierModal  from '../components/register-supplier-modal.vue'

const { t } = useI18n()
const store = useInventoryStore()
const toast = useToast()

const searchQuery = ref('')
const categoryFilter = ref('all')
const stockLevelFilter = ref('all')
const showAddProduct = ref(false)
const selectedProductRestock = ref(null)
const showBulkRestock = ref(false)
const showAuditLog = ref(false)
const selectedProductEdit = ref(null)
const showRegisterSupplier = ref(false)

// Right-click context menu
const contextMenuRef = ref(null)
const contextProduct = ref(null)

const contextMenuItems = computed(() => [
  {
    label: t('inventory.table.replenish'),
    icon: 'pi pi-arrow-up',
    command: () => { selectedProductRestock.value = contextProduct.value }
  },
  {
    label: t('inventory.table.edit'),
    icon: 'pi pi-pencil',
    command: () => { selectedProductEdit.value = contextProduct.value }
  },
  { separator: true },
  {
    label: t('inventory.table.copySku'),
    icon: 'pi pi-copy',
    command: () => { navigator.clipboard.writeText(contextProduct.value?.sku || '') }
  },
  {
    label: t('inventory.viewAudit'),
    icon: 'pi pi-file-edit',
    command: () => { showAuditLog.value = true }
  }
])

function onRowContextMenu(event, product) {
  contextProduct.value = product
  contextMenuRef.value.show(event)
}

const categories = computed(() => [
  { label: t('inventory.allCategories'),              value: 'all' },
  { label: t('inventory.categories.lenses'),          value: 'Lunas' },
  { label: t('inventory.categories.frames'),          value: 'Armazones' },
  { label: t('inventory.categories.accessories'),     value: 'Accesorios' },
  { label: t('inventory.categories.contactLenses'),   value: 'Lentes de Contacto' },
  { label: t('inventory.categories.sunLenses'),       value: 'Lentes de Sol' },
  { label: t('inventory.categories.equipment'),       value: 'Equipos' }
])

const stockLevels = computed(() => [
  { label: t('inventory.allLevels'),        value: 'all' },
  { label: t('inventory.levels.critical'),  value: 'critical' },
  { label: t('inventory.levels.low'),       value: 'low' },
  { label: t('inventory.levels.inStock'),   value: 'normal' }
])

function getStockStatus(stock, threshold) {
  const pct = (stock / threshold) * 100
  if (pct <= 50)  return { status: 'critical', color: 'text--red' }
  if (pct <= 100) return { status: 'low',      color: 'text--yellow' }
  return                 { status: 'normal',   color: 'text--green' }
}

const summary = computed(() => {
  const totalStock = store.products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const totalValue = store.products.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0)
  const lowStockList = store.products.filter(p => p.stock <= p.minimumStockThreshold)
  const healthyCount = store.products.filter(p => p.stock > p.minimumStockThreshold).length
  const healthPct = store.products.length ? Math.round((healthyCount / store.products.length) * 100) : 0

  return [
    {
      labelKey: 'inventory.summary.totalItems',
      value: String(totalStock),
      icon: 'pi pi-box',
      trend: healthPct >= 50 ? 'up' : 'down',
      change: `${healthPct}%`
    },
    {
      labelKey: 'inventory.summary.lowStock',
      value: String(lowStockList.length),
      icon: 'pi pi-exclamation-triangle',
      trend: 'down',
      change: `${lowStockList.length} ${t('inventory.summary.articles')}`
    },
    {
      labelKey: 'inventory.summary.totalValue',
      value: `S/ ${totalValue.toFixed(0)}`,
      icon: 'pi pi-chart-line'
    }
  ]
})

const hasActiveFilters = computed(() =>
    searchQuery.value ||
    categoryFilter.value !== 'all' ||
    stockLevelFilter.value !== 'all'
)

const filteredProducts = computed(() => {
  let list = store.products
  const query = searchQuery.value.toLowerCase()
  if (query) list = list.filter(product =>
      (product.name || '').toLowerCase().includes(query) ||
      (product.sku || '').toLowerCase().includes(query) ||
      (product.category || '').toLowerCase().includes(query) ||
      (product.supplierName || '').toLowerCase().includes(query)
  )
  if (categoryFilter.value !== 'all')
    list = list.filter(product => product.category === categoryFilter.value)
  if (stockLevelFilter.value !== 'all') {
    list = list.filter(product => {
      const { status } = getStockStatus(product.stock, product.minimumStockThreshold)
      return status === stockLevelFilter.value
    })
  }
  return list
})

const existingSkus = computed(() =>
    store.products.map(product => (product.sku || '').toUpperCase())
)

let unsubCreated, unsubUpdated, unsubRestocked, unsubLowAlert

onMounted(async () => {
  store.loadProducts()
  store.loadCategories()
  store.loadSuppliers()

  // Event-driven reactions: store emits, view reacts
  unsubCreated = eventBus.on(InventoryEvents.PRODUCT_CREATED, ({ product }) => {
    showAddProduct.value = false
    toast.add({
      severity: 'success',
      summary: t('inventory.toast.itemAdded'),
      detail: `${product.name} ${t('inventory.toast.itemAddedDetail')}`,
      life: 2500
    })
  })

  unsubUpdated = eventBus.on(InventoryEvents.PRODUCT_UPDATED, ({ product }) => {
    selectedProductEdit.value = null
    toast.add({
      severity: 'success',
      summary: t('inventory.toast.itemUpdated'),
      detail: t('inventory.toast.itemUpdatedDetail', { name: product.name }),
      life: 2500
    })
  })

  unsubRestocked = eventBus.on(InventoryEvents.STOCK_RESTOCKED, ({ product, qty }) => {
    toast.add({
      severity: 'success',
      summary: t('inventory.toast.restockDone'),
      detail: `+${qty} ${t('inventory.toast.restockDetail')}`,
      life: 2500
    })
  })

  unsubLowAlert = eventBus.on(InventoryEvents.STOCK_LOW_ALERT, ({ product }) => {
    toast.add({
      severity: 'warn',
      summary: t('inventory.toast.lowStock'),
      detail: t('inventory.toast.lowStockDetail', { name: product.name, threshold: product.minimumStockThreshold }),
      life: 4000
    })
  })
})

onUnmounted(() => {
  unsubCreated?.()
  unsubUpdated?.()
  unsubRestocked?.()
  unsubLowAlert?.()
})

function clearFilters() {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  stockLevelFilter.value = 'all'
}

async function onAddProduct(data) {
  await store.createProductFromResource(data)
  // PRODUCT_CREATED event → event handler closes modal + shows toast
}

async function onRestock({ id, qty, operation }) {
  await store.restock(id, qty, operation)
  // store.restock persists to API, then emits STOCK_RESTOCKED → toast + Kardex entry
}

async function onEditProduct(updatedProduct) {
  await store.updateProduct(updatedProduct)
  // PRODUCT_UPDATED event → event handler closes modal + shows toast
}

function onSupplierRegistered(supplier) {
  store.loadSuppliers()
  toast.add({
    severity: 'success',
    summary: t('inventory.supplierModal.title'),
    detail: `${supplier.name} ${t('inventory.toast.itemAddedDetail')}`,
    life: 2500
  })
}
</script>

<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('inventory.pageTitle') }}</h1>
        <p class="page-subtitle">{{ $t('inventory.pageSubtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="showAuditLog = true">
          <i class="pi pi-file-edit" />
          <span>{{ $t('inventory.viewAudit') }}</span>
        </button>
        <button class="btn-secondary" @click="showBulkRestock = true">
          <i class="pi pi-box" />
          <span>{{ $t('inventory.restock') }}</span>
        </button>
        <button class="btn-secondary" @click="showRegisterSupplier = true">
          <i class="pi pi-truck" />
          <span>{{ $t('inventory.supplierModal.title') }}</span>
        </button>
        <button class="btn-primary" @click="showAddProduct = true">
          <i class="pi pi-plus" /> {{ $t('inventory.addItem') }}
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-grid">
      <div v-for="item in summary" :key="item.labelKey" class="summary-card">
        <div class="summary-top">
          <div class="summary-icon">
            <i :class="item.icon" />
          </div>
          <div v-if="item.change" class="summary-trend" :class="item.trend === 'up' ? 'trend--up' : 'trend--neutral'">
            <i :class="item.trend === 'up' ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'" />
            <span>{{ item.change }}</span>
          </div>
        </div>
        <p class="summary-value">{{ item.value }}</p>
        <p class="summary-label">{{ $t(item.labelKey) }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" />
        <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('inventory.searchPlaceholder')"
            class="search-input"
        />
      </div>
      <div class="filter-wrapper">
        <select v-model="categoryFilter" class="filter-select">
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <i class="pi pi-chevron-down filter-arrow" />
      </div>
      <div class="filter-wrapper">
        <select v-model="stockLevelFilter" class="filter-select">
          <option v-for="level in stockLevels" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
        <i class="pi pi-chevron-down filter-arrow" />
      </div>
      <button v-if="hasActiveFilters" class="btn-clear" @click="clearFilters">
        {{ $t('common.clearFilters') }}
      </button>
    </div>
    <p v-if="hasActiveFilters" class="active-filters">
      <strong>{{ $t('inventory.activeFilters') }}:</strong>
      {{ searchQuery ? `"${searchQuery}"` : '' }}
      {{ categoryFilter !== 'all' ? categoryFilter : '' }}
      {{ stockLevelFilter !== 'all' ? stockLevelFilter : '' }}
    </p>

    <!-- Table -->
    <div class="table-wrapper">
      <div class="table-header-row">
        <span>{{ $t('inventory.table.product') }}</span>
        <span>{{ $t('inventory.table.category') }}</span>
        <span>{{ $t('inventory.table.stock') }}</span>
        <span class="text-right">{{ $t('inventory.table.price') }}</span>
        <span>{{ $t('inventory.table.supplier') }}</span>
        <span>{{ $t('inventory.table.actions') }}</span>
      </div>

      <div v-if="filteredProducts.length === 0" class="table-empty">
        <div class="empty-icon"><i class="pi pi-box" /></div>
        <p class="empty-title">{{ $t('inventory.table.incompatible') }}</p>
        <p class="empty-desc">{{ $t('inventory.table.noResults') }}</p>
        <button v-if="hasActiveFilters" class="btn-clear-empty" @click="clearFilters">
          {{ $t('inventory.auditModal.clearFilters') }}
        </button>
      </div>

      <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="table-row"
          @contextmenu.prevent="onRowContextMenu($event, product)"
      >
        <div class="row-product">
          <div class="product-icon"><i class="pi pi-box" /></div>
          <div>
            <p class="product-name">{{ product.name }}</p>
            <span class="product-sku">{{ product.sku }}</span>
          </div>
        </div>

        <span class="category-chip">{{ product.category }}</span>

        <div class="stock-cell">
          <div class="stock-top">
            <i
                v-if="getStockStatus(product.stock, product.minimumStockThreshold).status !== 'normal'"
                class="pi pi-exclamation-triangle"
                :class="getStockStatus(product.stock, product.minimumStockThreshold).color"
            />
            <span class="stock-value" :class="getStockStatus(product.stock, product.minimumStockThreshold).color">
              {{ product.stock }}
              <span class="stock-min">/ {{ $t('inventory.table.min') }} {{ product.minimumStockThreshold }}</span>
            </span>
          </div>
          <div class="stock-bar">
            <div
                class="stock-fill"
                :class="`fill--${getStockStatus(product.stock, product.minimumStockThreshold).status}`"
                :style="{ width: `${Math.min((product.stock / product.minimumStockThreshold) * 100, 100)}%` }"
            />
          </div>
        </div>

        <span class="text-right price-value">S/ {{ (product.price || 0).toFixed(2) }}</span>

        <span class="supplier-value">{{ product.supplierName }}</span>

        <div class="row-actions">
          <button class="btn-reponer" @click="selectedProductRestock = product">
            {{ $t('inventory.table.replenish') }}
          </button>
          <button class="btn-editar" @click="selectedProductEdit = product">{{ $t('inventory.table.edit') }}</button>
        </div>
      </div>

      <div class="table-footer">
        <span>
          {{ $t('inventory.table.showing') }} {{ filteredProducts.length }}
          {{ $t('inventory.table.of') }}
          {{ store.products.length }}
          {{ $t('inventory.table.items') }}
        </span>
        <div class="pagination">
          <button class="page-btn">{{ $t('common.previous') }}</button>
          <button class="page-btn page-btn--active">1</button>
          <button class="page-btn">{{ $t('common.next') }}</button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ModalAddProduct
        v-if="showAddProduct"
        :existing-skus="existingSkus"
        @save="onAddProduct"
        @close="showAddProduct = false"
    />
    <ModalRestock
        v-if="selectedProductRestock"
        :product="selectedProductRestock"
        @restock="onRestock"
        @close="selectedProductRestock = null"
    />
    <ModalBulkRestock
        v-if="showBulkRestock"
        :products="store.products"
        @restock="onRestock"
        @close="showBulkRestock = false"
    />
    <ModalAuditLog
        v-if="showAuditLog"
        :products="store.products"
        @close="showAuditLog = false"
    />

    <ModalEditProduct
        v-if="selectedProductEdit"
        :product="selectedProductEdit"
        @save="onEditProduct"
        @close="selectedProductEdit = null"
    />

    <RegisterSupplierModal
        v-if="showRegisterSupplier"
        @register="onSupplierRegistered"
        @close="showRegisterSupplier = false"
    />

    <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />
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
.btn-clear { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; padding: 7px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; cursor: pointer; }
.btn-clear:hover { background: #f9fafb; }
.active-filters { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: -8px 0 0; padding: 0 4px; }
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
.fill--normal   { background: #22c55e; }
.fill--low      { background: #eab308; }
.fill--critical { background: #ef4444; }
.text--green  { color: #16a34a; }
.text--yellow { color: #ca8a04; }
.text--red    { color: #dc2626; }
.text-right { text-align: right; }
.price-value { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; text-align: right; }
.supplier-value { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-actions { display: flex; gap: 6px; }
.btn-reponer { padding: 6px 12px; border: none; border-radius: 8px; background: #16a34a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.76rem; font-weight: 600; cursor: pointer; }
.btn-reponer:hover { opacity: 0.9; }
.btn-editar { padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151; font-family: 'Montserrat', sans-serif; font-size: 0.76rem; font-weight: 600; cursor: pointer; }
.btn-editar:hover { background: #f9fafb; }
.table-empty { padding: 64px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.empty-icon { width: 48px; height: 48px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 1.2rem; }
.empty-title { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #374151; margin: 0; }
.empty-desc { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #9ca3af; margin: 0; }
.btn-clear-empty { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 7px 14px; border: 1px solid #00c1b0; border-radius: 8px; background: #fff; color: #00c1b0; cursor: pointer; margin-top: 4px; }
.table-footer { padding: 12px 20px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.table-footer span { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.pagination { display: flex; gap: 6px; }
.page-btn { padding: 5px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; cursor: pointer; }
.page-btn:hover { background: #f9fafb; }
.page-btn--active { background: #00c1b0; color: #fff; border-color: #00c1b0; }

</style>