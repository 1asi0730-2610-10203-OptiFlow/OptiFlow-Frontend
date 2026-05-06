<script setup>
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
    <work-order-item
        v-for="wo in workOrders"
        :key="wo.id"
        :work-order="wo"
        @status-changed="emitOrderSelected(wo)"
    />
    <div v-if="workOrders.length === 0" class="empty">
      <i class="pi pi-inbox" />
      <span>Sin órdenes</span>
    </div>
  </div>
</template>

<style scoped>
.order-list { display: flex; flex-direction: column; gap: 10px; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 32px 0; color: #9ca3af; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; }
.empty i { font-size: 1.6rem; }
</style>