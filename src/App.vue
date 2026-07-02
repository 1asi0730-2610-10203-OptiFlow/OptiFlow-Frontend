<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout   from './shared/presentation/components/layout.vue'
import PatientLayout from './shared/presentation/components/patient-layout.vue'

const route = useRoute()

const isPatient = computed(() => route.path.startsWith('/patient/'))
const isAdmin   = computed(() => {
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/']
  return !isPatient.value && !publicPaths.includes(route.path)
})
</script>

<template>
  <AdminLayout   v-if="isAdmin" />
  <PatientLayout v-else-if="isPatient" />
  <router-view   v-else />
</template>
