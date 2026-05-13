<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  logs: { type: Array, default: () => [] }
})
const emit = defineEmits(['close'])

const startDate = ref('')
const endDate = ref('')

const filteredLogs = computed(() => {
  return props.logs.filter(log => {
    if (!startDate.value && !endDate.value) return true
    const logDate = new Date(log.date)
    const start = startDate.value ? new Date(startDate.value) : null
    const end = endDate.value ? new Date(endDate.value) : null
    if (start && end) return logDate >= start && logDate <= end
    if (start) return logDate >= start
    if (end) return logDate <= end
    return true
  })
})

function clearFilters() {
  startDate.value = ''
  endDate.value = ''
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>

      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <i class="pi pi-file-edit" />
          </div>
          <div>
            <h3 class="modal-title">{{ $t('inventory.auditModal.title') }}</h3>
            <p class="modal-subtitle">{{ $t('inventory.auditModal.subtitle') }}</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <i class="pi pi-calendar filter-icon" />
          <label>{{ $t('inventory.auditModal.from') }}:</label>
          <input v-model="startDate" type="date" class="date-input" />
        </div>
        <div class="filter-group">
          <label>{{ $t('inventory.auditModal.to') }}:</label>
          <input v-model="endDate" type="date" class="date-input" />
        </div>
        <button v-if="startDate || endDate" class="btn-clear" @click="clearFilters">
          {{ $t('inventory.auditModal.clearFilters') }}
        </button>
        <span class="results-count">
          <strong>{{ filteredLogs.length }}</strong> {{ $t('inventory.auditModal.recordsFound') }}
        </span>
      </div>

      <div class="modal-body">
        <div v-if="filteredLogs.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-file-edit" />
          </div>
          <h4 class="empty-title">{{ $t('inventory.auditModal.noRecords') }}</h4>
          <p class="empty-desc">{{ $t('inventory.auditModal.noRecordsDesc') }}</p>
        </div>

        <div v-else class="table-wrapper">
          <div class="table-header">
            <span>{{ $t('inventory.auditModal.columns.date') }}</span>
            <span>{{ $t('inventory.auditModal.columns.time') }}</span>
            <span>{{ $t('inventory.auditModal.columns.author') }}</span>
            <span>{{ $t('inventory.auditModal.columns.item') }}</span>
            <span>{{ $t('inventory.auditModal.columns.sku') }}</span>
            <span>{{ $t('inventory.auditModal.columns.operation') }}</span>
            <span>{{ $t('inventory.auditModal.columns.previousStock') }}</span>
            <span>{{ $t('inventory.auditModal.columns.quantity') }}</span>
            <span>{{ $t('inventory.auditModal.columns.newStock') }}</span>
          </div>
          <div
              v-for="log in filteredLogs"
              :key="log.id"
              class="table-row"
          >
            <div class="cell-date">
              <i class="pi pi-calendar cell-icon" />
              <span>{{ log.date }}</span>
            </div>
            <span class="cell-muted">{{ log.time }}</span>
            <div class="cell-author">
              <div class="author-avatar"><i class="pi pi-user" /></div>
              <span>{{ log.author }}</span>
            </div>
            <span>{{ log.itemName }}</span>
            <span class="cell-mono">{{ log.sku }}</span>
            <span class="cell-operation">{{ log.operation }}</span>
            <span class="cell-muted">{{ log.previousStock }} {{ $t('inventory.restockModal.units') }}</span>
            <span class="cell-qty">+{{ log.quantity }} {{ $t('inventory.restockModal.units') }}</span>
            <span class="cell-bold">{{ log.newStock }} {{ $t('inventory.restockModal.units') }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close" @click="emit('close')">{{ $t('common.close') }}</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(0,193,176,0.1); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.filters-bar { display: flex; align-items: center; gap: 16px; padding: 12px 24px; background: #f9fafb; border-bottom: 1px solid #f3f4f6; flex-wrap: wrap; flex-shrink: 0; }
.filter-group { display: flex; align-items: center; gap: 8px; }
.filter-icon { color: #6b7280; font-size: 0.85rem; }
.filter-group label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.date-input { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; outline: none; transition: border-color 0.15s; }
.date-input:focus { border-color: #00c1b0; }
.btn-clear { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; font-weight: 600; padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; cursor: pointer; }
.btn-clear:hover { background: #f3f4f6; }
.results-count { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; margin-left: auto; }
.modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; flex-shrink: 0; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; }
.empty-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(0,193,176,0.08); display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 1.6rem; margin-bottom: 16px; }
.empty-title { font-family: 'Josefin Sans', sans-serif; font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 8px; }
.empty-desc { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; text-align: center; margin: 0; max-width: 340px; }
.table-wrapper { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.table-header { display: grid; grid-template-columns: 100px 70px 120px 1fr 90px 140px 90px 90px 90px; gap: 8px; padding: 10px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-family: 'Montserrat', sans-serif; font-size: 0.7rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.table-row { display: grid; grid-template-columns: 100px 70px 120px 1fr 90px 140px 90px 90px 90px; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f9fafb; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; }
.table-row:hover { background: #f9fafb; }
.table-row:last-child { border-bottom: none; }
.cell-date { display: flex; align-items: center; gap: 6px; }
.cell-icon { font-size: 0.75rem; color: #9ca3af; }
.cell-muted { color: #6b7280; }
.cell-author { display: flex; align-items: center; gap: 6px; }
.author-avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(0,193,176,0.1); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; flex-shrink: 0; }
.cell-mono { font-family: 'Courier New', monospace; font-size: 0.76rem; color: #6b7280; }
.cell-operation { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; background: rgba(0,193,176,0.1); color: #00c1b0; font-size: 0.74rem; font-weight: 600; white-space: nowrap; }
.cell-qty { font-weight: 700; color: #16a34a; }
.cell-bold { font-weight: 700; color: #111827; }
.btn-close { padding: 9px 20px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-close:hover { opacity: 0.9; }
</style>