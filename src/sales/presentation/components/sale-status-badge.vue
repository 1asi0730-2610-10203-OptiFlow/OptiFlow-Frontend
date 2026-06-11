<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  status: { type: String, required: true }
})

const { t } = useI18n()

const styleMap = {
  PENDING:   { bg: '#fef9c2', color: '#a65f00' },
  PARTIAL:   { bg: '#fef9c2', color: '#a65f00' },
  PAID:      { bg: '#dcfce7', color: '#008236' },
  DELIVERED: { bg: '#dcfce7', color: '#008236' },
  RETURNED:  { bg: '#fee2e2', color: '#b91c1c' }
}

const badge = computed(() => {
  const style = styleMap[props.status] ?? { bg: '#f3f4f6', color: '#374151' }
  const label = styleMap[props.status]
    ? t(`sales.status.${props.status}`)
    : props.status
  return { ...style, label }
})
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
