<script setup>
import { ref, onMounted } from 'vue';
import { RolesApi } from '../../infrastructure/roles-api.js';
import { RoleAssembler } from '../../infrastructure/role.assembler.js';
import RoleListItem from '../components/role-list-item.vue';
import RolesSummary from '../components/roles-summary.vue';
import SystemStatus from '../components/system-status.vue';

const roles = ref([]);
const rolesApi = new RolesApi();
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;
    const [rolesData, employeesData] = await Promise.all([
      rolesApi.getAll(),
      rolesApi.getEmployees()
    ]);
    roles.value = RoleAssembler.toEntities(rolesData, employeesData);
  } catch (error) {
    console.error('Error fetching settings data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="settings-container p-4 lg:p-6">
    <header class="mb-6">
      <h1 class="text-900 font-bold text-3xl lg:text-4xl mb-2 mt-0">Configuración</h1>
      <p class="text-600 text-lg m-0">Ajustes del sistema y gestión de permisos</p>
    </header>

    <div class="grid">
      <!-- Main Content: Role Management -->
      <div class="col-12 lg:col-8">
        <pv-card class="shadow-1 border-none">
          <template #content>
            <div class="flex align-items-center justify-content-between mb-6">
              <div class="flex align-items-center gap-3">
                <div class="icon-header flex align-items-center justify-content-center border-round-md" 
                     style="background-color: #00c1b015; color: #00c1b0; width: 48px; height: 48px; border: 1px solid #00c1b030">
                  <i class="pi pi-shield text-2xl"></i>
                </div>
                <div>
                  <h2 class="text-900 font-bold text-xl lg:text-2xl m-0">Gestión de Roles</h2>
                  <p class="text-500 m-0 text-sm lg:text-base">Definir y gestionar roles y permisos de usuario</p>
                </div>
              </div>
              <pv-button label="Agregar Rol" icon="pi pi-plus" class="p-button-primary border-round-lg font-bold px-4" 
                         style="background-color: #00c1b0; border-color: #00c1b0" />
            </div>

            <div v-if="loading" class="flex justify-content-center py-8">
              <pv-progress-spinner style="width: 50px; height: 50px" />
            </div>
            <div v-else class="roles-list">
              <RoleListItem v-for="role in roles" :key="role.id" :role="role" />
            </div>
          </template>
        </pv-card>
      </div>

      <!-- Sidebar: Summary and Status -->
      <div class="col-12 lg:col-4">
        <RolesSummary :roles="roles" />
        <SystemStatus />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 1400px;
  margin: 0 auto;
}
:deep(.p-card-body) {
  padding: 2rem;
}
</style>
