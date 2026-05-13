<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout   from './shared/presentation/components/layout.vue'
import PatientLayout from './shared/presentation/components/patient-layout.vue'

const route = useRoute()

const isPatient = computed(() => route.path.startsWith('/patient/'))
const isAdmin   = computed(() => !isPatient.value && route.path !== '/login' && route.path !== '/')
</script>

<template>
  <AdminLayout   v-if="isAdmin" />
  <PatientLayout v-else-if="isPatient" />
  <router-view   v-else />
</template>
