<script setup>
import { useI18n } from 'vue-i18n'
import WorkOrderItem from './work-order-item.vue'

const { t } = useI18n()

const props = defineProps({
  workOrders: { type: Array, default: () => [] }
})

const emit = defineEmits(['orderSelected'])

function emitOrderSelected(workOrder) {
  emit('orderSelected', workOrder)
}
</script>

<template>
  <div class="order-list">
    <WorkOrderItem
        v-for="workOrder in workOrders"
        :key="workOrder.id"
        :work-order="workOrder"
        @status-changed="emitOrderSelected(workOrder)"
    />
    <div v-if="workOrders.length === 0" class="empty">
      <i class="pi pi-inbox" />
      <span>{{ $t('labOrders.kanban.noOrders') }}</span>
    </div>
  </div>
</template>

<style scoped>
.order-list { display: flex; flex-direction: column; gap: 10px; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 32px 0; color: #9ca3af; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; }
.empty i { font-size: 1.6rem; }
</style>