<script setup>
import { useI18n } from 'vue-i18n'
import WorkOrderItem from './work-order-item.vue'

const { t } = useI18n()

const props = defineProps({
  workOrders: { type: Array, default: () => [] }
})
const emit = defineEmits(['statusChanged', 'orderClick'])

const columns = [
  { key: 'PENDING',         colorClass: 'col--gray',   bgClass: 'colbg--gray' },
  { key: 'IN_PRODUCTION',   colorClass: 'col--teal',   bgClass: 'colbg--teal' },
  { key: 'QUALITY_CONTROL', colorClass: 'col--purple', bgClass: 'colbg--purple' },
  { key: 'READY',           colorClass: 'col--green',  bgClass: 'colbg--green' },
  { key: 'DELIVERED',       colorClass: 'col--light',  bgClass: 'colbg--light' }
]

function ordersForColumn(key) {
  return props.workOrders.filter(workOrder => workOrder.status === key)
}

function onStatusChanged(workOrder, status) {
  emit('statusChanged', { workOrder, status })
}
</script>

<template>
  <div class="kanban">
    <div v-for="col in columns" :key="col.key" class="kanban-col">
      <div class="col-header" :class="col.bgClass">
        <span class="col-title" :class="col.colorClass">
          {{ $t(`labOrders.status.${col.key}`) }}
        </span>
        <span class="col-count" :class="col.colorClass">
          {{ ordersForColumn(col.key).length }}
        </span>
      </div>
      <div class="col-body">
        <WorkOrderItem
            v-for="workOrder in ordersForColumn(col.key)"
            :key="workOrder.id"
            :work-order="workOrder"
            @status-changed="(status) => onStatusChanged(workOrder, status)"
            @click="emit('orderClick', workOrder)"
        />
        <div v-if="ordersForColumn(col.key).length === 0" class="col-empty">
          {{ $t('labOrders.kanban.noOrders') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 16px; width: 100%; min-width: 0; }
.kanban-col { flex-shrink: 0; flex: 1; min-width: 200px; max-width: 260px; }
.col-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; }
.col-title { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 700; }
.col-count { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700; padding: 1px 8px; border-radius: 20px; background: white; }
.col-body { display: flex; flex-direction: column; gap: 10px; }
.col-empty { text-align: center; padding: 24px 0; font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #9ca3af; border: 2px dashed #e5e7eb; border-radius: 10px; }
.col--gray   { color: #4b5563; } .col--teal   { color: #00c1b0; } .col--purple { color: #7c3aed; } .col--green  { color: #16a34a; } .col--light  { color: #9ca3af; }
.colbg--gray   { background: #f3f4f6; } .colbg--teal   { background: rgba(0,193,176,0.1); } .colbg--purple { background: #ede9fe; } .colbg--green  { background: #dcfce7; } .colbg--light  { background: #f9fafb; }

@media (max-width: 640px) {
  /* ~75vw por columna: muestra 1 columna completa + "peek" de la siguiente */
  .kanban-col { min-width: 75vw; max-width: 80vw; }
}
</style>