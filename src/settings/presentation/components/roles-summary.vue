<script setup>
defineProps({
  roles: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <pv-card class="roles-summary-card shadow-1 border-none mb-4">
    <template #title>
      <h3 class="text-900 font-bold text-xl m-0">Resumen de Roles</h3>
    </template>
    <template #content>
      <div v-for="role in roles" :key="role.id" class="flex align-items-center justify-content-between mb-3 last:mb-0">
        <div class="flex align-items-center gap-3">
          <div class="w-1rem h-1rem border-circle" :style="{ backgroundColor: role.color }"></div>
          <span class="text-700 font-medium">{{ role.name }}</span>
        </div>
        <span class="text-500 text-sm">{{ role.userCount }} usuario(s)</span>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
:deep(.p-card-body) {
  padding: 1.5rem;
}
:deep(.p-card-title) {
  margin-bottom: 1.5rem;
}
</style>
