<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { eventBus } from '../../../shared/infrastructure/event-bus.js'

const router = useRouter()
const { t } = useI18n()

const isOpen      = ref(false)
const query       = ref('')
const activeIndex = ref(-1)
const inputRef    = ref(null)
const listRef     = ref(null)

const allActions = computed(() => [
  // ── Navigation ──────────────────────────────────────────────────────────
  {
    id: 'nav-panel', category: 'navigation',
    label: t('nav.panel'), icon: 'pi pi-home', route: '/panel',
    keywords: ['dashboard', 'home', 'panel', 'inicio', 'resumen'],
  },
  {
    id: 'nav-patients', category: 'navigation',
    label: t('nav.patients'), icon: 'pi pi-users', route: '/patients',
    keywords: ['patients', 'clinical', 'hce', 'pacientes', 'clínica', 'médico', 'historia'],
  },
  {
    id: 'nav-sales', category: 'navigation',
    label: t('nav.sales'), icon: 'pi pi-shopping-cart', route: '/sales',
    keywords: ['sales', 'pos', 'invoice', 'ventas', 'factura', 'cobrar', 'pago'],
  },
  {
    id: 'nav-lab', category: 'navigation',
    label: t('nav.labOrders'), icon: 'pi pi-wrench', route: '/lab-orders',
    keywords: ['lab', 'orders', 'laboratory', 'órdenes', 'laboratorio', 'kanban', 'trabajo'],
  },
  {
    id: 'nav-inventory', category: 'navigation',
    label: t('nav.inventory'), icon: 'pi pi-box', route: '/inventory',
    keywords: ['inventory', 'stock', 'products', 'inventario', 'productos', 'artículos'],
  },
  {
    id: 'nav-staff', category: 'navigation',
    label: t('nav.staff'), icon: 'pi pi-id-card', route: '/staff',
    keywords: ['staff', 'employees', 'team', 'personal', 'empleados', 'equipo'],
  },
  {
    id: 'nav-reports', category: 'navigation',
    label: t('nav.reports'), icon: 'pi pi-chart-bar', route: '/reports',
    keywords: ['reports', 'analytics', 'charts', 'reportes', 'analítica', 'estadísticas'],
  },
  {
    id: 'nav-settings', category: 'navigation',
    label: t('nav.settings'), icon: 'pi pi-cog', route: '/settings',
    keywords: ['settings', 'config', 'configuration', 'configuración', 'ajustes'],
  },

  // ── Quick Actions ────────────────────────────────────────────────────────
  {
    id: 'action-new-sale', category: 'actions',
    label: t('sales.newSale'), icon: 'pi pi-receipt', route: '/sales',
    action: 'ui:open:new-sale',
    description: t('nav.sales'),
    keywords: ['new sale', 'create sale', 'nueva venta', 'pos', 'cobrar', 'facturar'],
  },
  {
    id: 'action-add-patient', category: 'actions',
    label: t('patients.addPatient'), icon: 'pi pi-user-plus', route: '/patients',
    action: 'ui:open:add-patient',
    description: t('nav.patients'),
    keywords: ['add patient', 'new patient', 'agregar paciente', 'registrar paciente'],
  },
  {
    id: 'action-new-lab-order', category: 'actions',
    label: t('labOrders.newOrder'), icon: 'pi pi-file-edit', route: '/lab-orders',
    action: 'ui:open:new-lab-order',
    description: t('nav.labOrders'),
    keywords: ['new order', 'lab order', 'nueva orden', 'crear orden', 'trabajo lab'],
  },
  {
    id: 'action-add-inventory', category: 'actions',
    label: t('inventory.addItem'), icon: 'pi pi-plus-circle', route: '/inventory',
    action: 'ui:open:add-product',
    description: t('nav.inventory'),
    keywords: ['add item', 'new product', 'agregar artículo', 'nuevo producto'],
  },
  {
    id: 'action-restock', category: 'actions',
    label: t('inventory.restock'), icon: 'pi pi-refresh', route: '/inventory',
    action: 'ui:open:bulk-restock',
    description: t('nav.inventory'),
    keywords: ['restock', 'replenish', 'reabastecer', 'reponer', 'stock bajo'],
  },
  {
    id: 'action-add-staff', category: 'actions',
    label: t('staff.addEmployee'), icon: 'pi pi-user-plus', route: '/staff',
    action: 'ui:open:add-staff',
    description: t('nav.staff'),
    keywords: ['add employee', 'new staff', 'agregar empleado', 'nuevo personal'],
  },
  {
    id: 'action-view-audit', category: 'actions',
    label: t('inventory.viewAudit'), icon: 'pi pi-history', route: '/inventory',
    action: 'ui:open:audit-log',
    description: t('nav.inventory'),
    keywords: ['audit', 'history', 'auditoría', 'historial', 'registro stock'],
  },
  {
    id: 'action-export-reports', category: 'actions',
    label: t('reports.export'), icon: 'pi pi-download', route: '/reports',
    description: t('nav.reports'),
    keywords: ['export', 'download', 'exportar', 'descargar', 'excel', 'pdf'],
  },
  {
    id: 'action-add-role', category: 'actions',
    label: t('settings.roles.addRole'), icon: 'pi pi-shield', route: '/settings',
    action: 'ui:open:add-role',
    description: t('settings.roles.subtitle'),
    keywords: ['add role', 'new role', 'agregar rol', 'nuevo rol', 'permissions', 'permisos', 'roles'],
  },
  {
    id: 'action-business-info', category: 'actions',
    label: t('settings.business.title'), icon: 'pi pi-building', route: '/settings',
    action: 'ui:open:business-info',
    description: t('settings.business.subtitle'),
    keywords: ['business', 'company', 'empresa', 'negocio', 'información negocio', 'business info'],
  },
  {
    id: 'action-security', category: 'actions',
    label: t('settings.security.title'), icon: 'pi pi-lock', route: '/settings',
    action: 'ui:open:security',
    description: t('settings.security.subtitle'),
    keywords: ['security', 'seguridad', '2fa', 'password', 'contraseña', 'encryption', 'cifrado', 'logout'],
  },
  {
    id: 'action-backup', category: 'actions',
    label: t('settings.backup.title'), icon: 'pi pi-database', route: '/settings',
    action: 'ui:open:backup',
    description: t('settings.backup.subtitle'),
    keywords: ['backup', 'backups', 'data', 'datos', 'copias', 'respaldo', 'storage', 'almacenamiento'],
  },
])

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return allActions.value
  return allActions.value.filter(a =>
    a.label.toLowerCase().includes(q) ||
    a.keywords.some(k => k.includes(q)) ||
    (a.description && a.description.toLowerCase().includes(q))
  )
})

const grouped = computed(() => {
  const nav     = filtered.value.filter(a => a.category === 'navigation')
  const actions = filtered.value.filter(a => a.category === 'actions')
  return [
    { key: 'navigation', label: t('search.categories.navigation'), items: nav },
    { key: 'actions',    label: t('search.categories.actions'),    items: actions },
  ].filter(g => g.items.length > 0)
})

function flatIndex(action) { return filtered.value.indexOf(action) }

function open() {
  isOpen.value = true
  query.value  = ''
  activeIndex.value = -1
  nextTick(() => inputRef.value?.focus())
}

function close() {
  isOpen.value = false
  query.value  = ''
  activeIndex.value = -1
}

async function select(action) {
  close()
  await router.push(action.route).catch(() => {})
  if (action.action) eventBus.emit(action.action)
}

function onKey(e) {
  const total = filtered.value.length
  if (e.key === 'Escape') { close(); return }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = activeIndex.value < total - 1 ? activeIndex.value + 1 : 0
    scrollActive()
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : total - 1
    scrollActive()
  }
  if (e.key === 'Enter' && activeIndex.value >= 0) {
    select(filtered.value[activeIndex.value])
  }
}

function scrollActive() {
  nextTick(() => {
    listRef.value?.querySelector('.result-item--active')?.scrollIntoView({ block: 'nearest' })
  })
}

function globalShortcut(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    isOpen.value ? close() : open()
  }
}

watch(query, () => { activeIndex.value = -1 })
onMounted(()  => document.addEventListener('keydown', globalShortcut))
onUnmounted(() => document.removeEventListener('keydown', globalShortcut))
defineExpose({ open })
</script>

<template>
  <!-- Trigger button in topbar -->
  <button class="search-trigger" @click="open" :title="$t('search.shortcutHint')">
    <i class="pi pi-search search-trigger__icon" />
    <span class="search-trigger__text">{{ $t('search.placeholder') }}</span>
    <kbd class="search-trigger__kbd">Ctrl+K</kbd>
  </button>

  <!-- Overlay portal -->
  <teleport to="body">
    <transition name="sf">
      <div v-if="isOpen" class="gs-overlay" @click.self="close">
        <div class="gs-box" role="dialog" aria-modal="true" :aria-label="$t('search.placeholder')">

          <!-- Input row -->
          <div class="gs-input-row">
            <i class="pi pi-search gs-input-row__icon" />
            <input
              ref="inputRef"
              v-model="query"
              class="gs-input"
              :placeholder="$t('search.inputPlaceholder')"
              autocomplete="off"
              spellcheck="false"
              @keydown="onKey"
            />
            <button class="gs-esc" @click="close">Esc</button>
          </div>

          <!-- Results -->
          <div ref="listRef" class="gs-results" v-if="filtered.length > 0">
            <template v-for="group in grouped" :key="group.key">
              <p class="gs-group-label">{{ group.label }}</p>
              <button
                v-for="item in group.items"
                :key="item.id"
                class="result-item"
                :class="{ 'result-item--active': flatIndex(item) === activeIndex }"
                @click="select(item)"
                @mouseenter="activeIndex = flatIndex(item)"
              >
                <span class="result-item__icon-wrap">
                  <i :class="item.icon" class="result-item__icon" />
                </span>
                <span class="result-item__body">
                  <span class="result-item__label">{{ item.label }}</span>
                  <span v-if="item.description" class="result-item__desc">{{ item.description }}</span>
                </span>
                <i class="pi pi-angle-right result-item__arrow" />
              </button>
            </template>
          </div>

          <!-- Empty state -->
          <div v-else class="gs-empty">
            <i class="pi pi-search gs-empty__icon" />
            <span>{{ $t('search.noResults') }} "<strong>{{ query }}</strong>"</span>
          </div>

          <!-- Footer hints -->
          <div class="gs-footer">
            <span><kbd>↑↓</kbd> {{ $t('search.hint.navigate') }}</span>
            <span><kbd>↵</kbd> {{ $t('search.hint.select') }}</span>
            <span><kbd>Esc</kbd> {{ $t('search.hint.close') }}</span>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* ── Trigger ──────────────────────────────────────────────────────────────── */
.search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 36px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  color: #9ca3af;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.82rem;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  min-width: 220px;
}
.search-trigger:hover {
  border-color: #00c1b0;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0, 193, 176, 0.1);
}
.search-trigger__icon { font-size: 0.85rem; color: #00c1b0; }
.search-trigger__text { flex: 1; text-align: left; }
.search-trigger__kbd {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.68rem;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 4px;
  padding: 2px 5px;
  border: 1px solid #d1d5db;
  line-height: 1.4;
}

/* ── Overlay ──────────────────────────────────────────────────────────────── */
.gs-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(3, 7, 10, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
  padding-bottom: 40px;
}

.gs-box {
  width: min(640px, 92vw);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: calc(100vh - 140px);
}

/* ── Input row ────────────────────────────────────────────────────────────── */
.gs-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: 58px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.gs-input-row__icon { font-size: 1.05rem; color: #00c1b0; flex-shrink: 0; }
.gs-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  color: #111827;
  background: transparent;
}
.gs-input::placeholder { color: #9ca3af; }
.gs-esc {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  border-radius: 5px;
  padding: 3px 7px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.gs-esc:hover { background: #e5e7eb; }

/* ── Results ──────────────────────────────────────────────────────────────── */
.gs-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.gs-results::-webkit-scrollbar { width: 4px; }
.gs-results::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.gs-group-label {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #93c1ce;
  padding: 10px 20px 4px;
  margin: 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  border-left: 3px solid transparent;
  transition: background 0.1s, border-color 0.1s;
}
.result-item:hover,
.result-item--active {
  background: rgba(0, 193, 176, 0.07);
  border-left-color: #00c1b0;
}

.result-item__icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 193, 176, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.result-item__icon { font-size: 0.85rem; color: #00c1b0; }
.result-item__body { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.result-item__label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-item__desc {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.73rem;
  color: #9ca3af;
}
.result-item__arrow {
  font-size: 0.8rem;
  color: #00c1b0;
  opacity: 0;
  transition: opacity 0.1s;
}
.result-item:hover .result-item__arrow,
.result-item--active .result-item__arrow { opacity: 1; }

/* ── Empty state ──────────────────────────────────────────────────────────── */
.gs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 20px;
  color: #9ca3af;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
}
.gs-empty__icon { font-size: 1.8rem; color: #e5e7eb; }

/* ── Footer hints ─────────────────────────────────────────────────────────── */
.gs-footer {
  display: flex;
  gap: 20px;
  padding: 10px 20px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  flex-shrink: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  color: #9ca3af;
}
.gs-footer kbd {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.68rem;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 1px 5px;
  color: #6b7280;
  margin-right: 3px;
}

/* ── Transition ───────────────────────────────────────────────────────────── */
.sf-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.sf-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.sf-enter-from   { opacity: 0; }
.sf-leave-to     { opacity: 0; }
.sf-enter-from .gs-box { transform: translateY(-10px) scale(0.98); }
.sf-leave-to .gs-box   { transform: translateY(-6px) scale(0.99); }

/* ── Mobile ───────────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .search-trigger__text { display: none; }
  .search-trigger { min-width: unset; padding: 0 10px; }
  .gs-overlay { padding-top: 16px; align-items: flex-start; }
  .gs-box { border-radius: 12px; }
}
</style>
