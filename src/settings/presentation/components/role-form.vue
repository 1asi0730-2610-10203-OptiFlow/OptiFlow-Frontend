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
  { id: 'dashboard', titleKey: 'settings.roles.permissions.dashboard.title', descKey: 'settings.roles.permissions.dashboard.desc' },
  { id: 'clinical', titleKey: 'settings.roles.permissions.clinical.title', descKey: 'settings.roles.permissions.clinical.desc' },
  { id: 'prescriptions', titleKey: 'settings.roles.permissions.prescriptions.title', descKey: 'settings.roles.permissions.prescriptions.desc' },
  { id: 'appointments', titleKey: 'settings.roles.permissions.appointments.title', descKey: 'settings.roles.permissions.appointments.desc' },
  { id: 'sales', titleKey: 'settings.roles.permissions.sales.title', descKey: 'settings.roles.permissions.sales.desc' },
  { id: 'lab_orders', titleKey: 'settings.roles.permissions.lab_orders.title', descKey: 'settings.roles.permissions.lab_orders.desc' },
  { id: 'inventory', titleKey: 'settings.roles.permissions.inventory.title', descKey: 'settings.roles.permissions.inventory.desc' },
  { id: 'staff', titleKey: 'settings.roles.permissions.staff.title', descKey: 'settings.roles.permissions.staff.desc' },
  { id: 'settings', titleKey: 'settings.roles.permissions.settings.title', descKey: 'settings.roles.permissions.settings.desc' },
  { id: 'reports', titleKey: 'settings.roles.permissions.reports.title', descKey: 'settings.roles.permissions.reports.desc' },
  { id: 'users', titleKey: 'settings.roles.permissions.users.title', descKey: 'settings.roles.permissions.users.desc' },
  { id: 'full_access', titleKey: 'settings.roles.permissions.full_access.title', descKey: 'settings.roles.permissions.full_access.desc' }
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
      <span>{{ $t('settings.roles.dialog.incompleteData') }}</span>
    </div>

    <div class="mb-4">
      <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.roles.dialog.roleName') }}</label>
      <pv-input-text v-model="roleName" 
                     :placeholder="$t('settings.roles.dialog.roleNamePlaceholder')" 
                     class="w-full border-round-lg p-3"
                     :class="{ 'p-invalid': submitted && !roleName.trim() }" />
      <small v-if="submitted && !roleName.trim()" class="text-red-500 block mt-1">{{ $t('settings.roles.dialog.nameRequired') }}</small>
    </div>

    <div class="mb-4">
      <label class="block text-900 font-medium mb-3 font-josefin">{{ $t('settings.roles.dialog.roleColor') }}</label>
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
      <label class="block text-900 font-medium mb-3 font-josefin">{{ $t('settings.roles.dialog.permissions') }}</label>
      <div class="permissions-container border-1 border-round-lg overflow-hidden"
           :class="submitted && selectedPermissions.length === 0 ? 'border-red-500' : 'border-100'">
        <div v-for="perm in permissions" :key="perm.id" 
             class="permission-item flex align-items-start gap-3 p-3 border-bottom-1 border-100 transition-colors hover:bg-gray-50">
          <pv-checkbox v-model="selectedPermissions" :value="perm.id" />
          <div class="flex flex-column">
            <span class="text-900 font-bold text-sm">{{ $t(perm.titleKey) }}</span>
            <span class="text-500 text-xs mt-1">{{ $t(perm.descKey) }}</span>
          </div>
        </div>
      </div>
      <p class="text-500 text-xs mt-2">{{ $t('settings.roles.dialog.permissionsSelected', { count: selectedPermissions.length }) }}</p>
    </div>

    <div class="flex justify-content-end gap-3 mt-5">
      <pv-button :label="$t('settings.roles.dialog.cancel')" variant="text" class="p-button-secondary font-bold px-5" @click="emit('cancel')" />
      <pv-button :label="$t('settings.roles.dialog.createRole')" class="p-button-primary border-round-lg font-bold px-6" 
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
  max-height: 500px;
  overflow-y: auto;
}
.permission-item:last-child {
  border-bottom: none;
}
</style>
