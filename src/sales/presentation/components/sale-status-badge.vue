<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const config = {
  PENDING:   { label: 'Pendiente',  severity: 'warn' },
  PARTIAL:   { label: 'Parcial',    severity: 'info' },
  PAID:      { label: 'Pagado',     severity: 'secondary' },
  DELIVERED: { label: 'Completada', severity: 'success' },
  RETURNED:  { label: 'Devuelta',   severity: 'danger' }
}

const badge = computed(() => config[props.status] ?? { label: props.status, severity: 'secondary' })
</script>

<template>
  <pv-tag :value="badge.label" :severity="badge.severity" rounded />
</template>
