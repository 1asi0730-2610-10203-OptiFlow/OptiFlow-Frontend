<script setup>
const statusItems = [
  { label: 'Servidor', value: 'En línea', status: 'success' },
  { label: 'Base de Datos', value: 'Conectada', status: 'success' },
  { label: 'Última Actualización', value: '15/04/2026', status: 'info' },
  { label: 'Versión', value: 'v2.4.1', status: 'info' }
];
</script>

<template>
  <pv-card class="system-status-card shadow-1 border-none">
    <template #title>
      <h3 class="text-900 font-bold text-xl m-0 font-josefin">Estado del Sistema</h3>
    </template>
    <template #content>
      <div v-for="item in statusItems" :key="item.label" class="flex align-items-center justify-content-between mb-3 last:mb-0">
        <span class="text-700 font-medium">{{ item.label }}</span>
        <div class="flex align-items-center gap-2">
          <div v-if="item.status === 'success'" class="w-2 h-2 border-circle bg-green-500"></div>
          <span class="font-medium" :class="item.status === 'success' ? 'text-green-600' : 'text-600'">
            {{ item.value }}
          </span>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.w-2 { width: 0.5rem; }
.h-2 { height: 0.5rem; }
:deep(.p-card-body) {
  padding: 1.5rem;
}
:deep(.p-card-title) {
  margin-bottom: 1.5rem;
}
</style>
