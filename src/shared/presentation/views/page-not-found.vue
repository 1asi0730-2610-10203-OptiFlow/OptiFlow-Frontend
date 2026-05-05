<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <i class="pi pi-exclamation-circle not-found__icon" />
    <h2>Página no encontrada</h2>
    <p>La ruta solicitada no existe en el sistema.</p>
    <pv-button label="Ir a Ventas" icon="pi pi-arrow-left" @click="router.push('/sales')" />
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: #6b7280;
  text-align: center;
}

.not-found__icon {
  font-size: 4rem;
  color: #d1d5db;
}
</style>
