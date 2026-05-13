<script setup>
import { ref, onMounted } from 'vue';
import { RolesApi } from '../../infrastructure/roles-api.js';
import { RoleAssembler } from '../../infrastructure/role.assembler.js';
import RoleListItem from '../components/role-list-item.vue';
import RolesSummary from '../components/roles-summary.vue';
import SystemStatus from '../components/system-status.vue';
import { useToast } from 'primevue/usetoast';
import RoleForm from '../components/role-form.vue';

const roles = ref([]);
const rolesApi = new RolesApi();
const loading = ref(true);
const showAddDialog = ref(false);
const toast = useToast();

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

const handleSaveRole = async (newRoleData) => {
  try {
    loading.value = true;
    // Prepare data for DB
    const roleToSave = {
      role_id: roles.value.length + 1, // Simple ID generation for mock
      name: newRoleData.name.toUpperCase().replace(/\s+/g, '_'), // Internal name
      displayName: newRoleData.name,
      description: newRoleData.description || 'Nuevo rol personalizado',
      color: newRoleData.color,
      permissions: newRoleData.permissions
    };
    
    await rolesApi.create(roleToSave);
    showAddDialog.value = false;
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente', life: 3000 });
    await fetchData();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el rol', life: 3000 });
    console.error('Error saving role:', error);
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
    <pv-toast />
    <header class="mb-6">
      <h1 class="text-900 font-bold text-3xl lg:text-4xl mb-2 mt-0 font-josefin">Configuración</h1>
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
                  <h2 class="text-900 font-bold text-xl lg:text-2xl m-0 font-josefin">Gestión de Roles</h2>
                  <p class="text-500 m-0 text-sm lg:text-base">Definir y gestionar roles y permisos de usuario</p>
                </div>
              </div>
              <pv-button label="Agregar Rol" icon="pi pi-plus" class="p-button-primary border-round-lg font-bold px-4" 
                         style="background-color: #00c1b0; border-color: #00c1b0" @click="showAddDialog = true" />
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

    <!-- Add Role Dialog -->
    <pv-dialog v-model:visible="showAddDialog" modal header="Agregar Nuevo Rol" :style="{ width: '500px' }" class="p-fluid">
      <template #header>
        <div class="flex flex-column gap-1">
          <h2 class="m-0 font-josefin text-xl font-bold">Agregar Nuevo Rol</h2>
          <span class="text-500 text-sm">Definir un nuevo rol de usuario y sus permisos</span>
        </div>
      </template>
      <RoleForm @save="handleSaveRole" @cancel="showAddDialog = false" />
    </pv-dialog>
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
:deep(.p-dialog-header) {
  padding-bottom: 0.5rem;
}
</style>
