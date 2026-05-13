<script setup>
import { ref } from 'vue';

const emit = defineEmits(['save', 'cancel']);

const roleName = ref('');
const selectedColor = ref('#3b82f6');
const selectedPermissions = ref([]);
const submitted = ref(false);

const colors = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f97316', // Orange
  '#6366f1'  // Indigo
];

const permissions = [
  { id: 'dashboard', title: 'Panel de Control', description: 'Ver resumen y estadísticas del negocio' },
  { id: 'clinical', title: 'Historias Clínicas', description: 'Ver y editar datos de pacientes' },
  { id: 'prescriptions', title: 'Recetas Ópticas', description: 'Crear y gestionar recetas' },
  { id: 'appointments', title: 'Citas', description: 'Ver y agendar citas' }
];

const handleSave = () => {
  submitted.value = true;
  if (roleName.value.trim() && selectedPermissions.value.length > 0) {
    emit('save', {
      name: roleName.value,
      color: selectedColor.value,
      permissions: selectedPermissions.value
    });
  }
};
</script>

<template>
  <div class="role-form">
    <div v-if="submitted && (!roleName.trim() || selectedPermissions.length === 0)" 
         class="bg-red-50 text-red-600 p-3 border-round-lg mb-4 text-sm font-bold flex align-items-center gap-2">
      <i class="pi pi-exclamation-circle"></i>
      <span>Datos incompletos</span>
    </div>

    <div class="mb-4">
      <label class="block text-900 font-medium mb-2 font-josefin">Nombre del Rol *</label>
      <pv-input-text v-model="roleName" 
                     placeholder="Ej. Técnico de Laboratorio" 
                     class="w-full border-round-lg p-3"
                     :class="{ 'p-invalid': submitted && !roleName.trim() }" />
      <small v-if="submitted && !roleName.trim()" class="text-red-500 block mt-1">El nombre es obligatorio</small>
    </div>

    <div class="mb-4">
      <label class="block text-900 font-medium mb-3 font-josefin">Color del Rol</label>
      <div class="flex gap-3">
        <div v-for="color in colors" :key="color" 
             @click="selectedColor = color"
             class="color-circle border-circle cursor-pointer flex align-items-center justify-content-center"
             :style="{ backgroundColor: color, width: '32px', height: '32px' }">
          <i v-if="selectedColor === color" class="pi pi-check text-white text-xs"></i>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-900 font-medium mb-3 font-josefin">Permisos</label>
      <div class="permissions-container border-1 border-round-lg overflow-hidden"
           :class="submitted && selectedPermissions.length === 0 ? 'border-red-500' : 'border-100'">
        <div v-for="perm in permissions" :key="perm.id" 
             class="permission-item flex align-items-start gap-3 p-3 border-bottom-1 border-100 transition-colors hover:bg-gray-50">
          <pv-checkbox v-model="selectedPermissions" :value="perm.id" />
          <div class="flex flex-column">
            <span class="text-900 font-bold text-sm">{{ perm.title }}</span>
            <span class="text-500 text-xs mt-1">{{ perm.description }}</span>
          </div>
        </div>
      </div>
      <p class="text-500 text-xs mt-2">{{ selectedPermissions.length }} permiso(s) seleccionado(s)</p>
    </div>

    <div class="flex justify-content-end gap-3 mt-5">
      <pv-button label="Cancelar" variant="text" class="p-button-secondary font-bold px-5" @click="emit('cancel')" />
      <pv-button label="Crear Rol" class="p-button-primary border-round-lg font-bold px-6" 
                 style="background-color: #00c1b0; border-color: #00c1b0" @click="handleSave" />
    </div>
  </div>
</template>

<style scoped>
.color-circle {
  transition: transform 0.2s;
}
.color-circle:hover {
  transform: scale(1.1);
}
.permissions-container {
  max-height: 250px;
  overflow-y: auto;
}
.permission-item:last-child {
  border-bottom: none;
}
</style>
