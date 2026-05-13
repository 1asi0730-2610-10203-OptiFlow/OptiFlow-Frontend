<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const config = {
  PENDING:   { label: 'Pendiente',       bg: '#fef9c2', color: '#a65f00' },
  PARTIAL:   { label: 'Saldo Pendiente', bg: '#fef9c2', color: '#a65f00' },
  PAID:      { label: 'Pagada',          bg: '#dcfce7', color: '#008236' },
  DELIVERED: { label: 'Completada',      bg: '#dcfce7', color: '#008236' },
  RETURNED:  { label: 'Devuelta',        bg: '#fee2e2', color: '#b91c1c' }
}

const badge = computed(() => config[props.status] ?? { label: props.status, bg: '#f3f4f6', color: '#374151' })
</script>

<template>
  <span class="status-badge" :style="{ backgroundColor: badge.bg, color: badge.color }">
    {{ badge.label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
