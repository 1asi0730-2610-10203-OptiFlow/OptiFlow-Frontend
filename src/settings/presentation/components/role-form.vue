<script setup>
import { ref } from 'vue';

const props = defineProps({
  role: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'cancel']);

const roleName = ref(props.role ? props.role.name : '');
const selectedColor = ref(props.role ? props.role.color : '#3b82f6');
const selectedPermissions = ref(props.role ? [...props.role.permissions] : []);
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
             :style="{ 
               backgroundColor: color, 
               width: '32px', 
               height: '32px',
               border: selectedColor === color ? '2px solid #ffffff' : 'none',
               boxShadow: selectedColor === color ? '0 0 0 2px #9ca3af' : 'none'
             }">
          <i v-if="selectedColor === color" class="pi pi-check text-white text-xs"></i>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-900 font-medium mb-3 font-josefin">{{ $t('settings.roles.dialog.permissions') }}</label>
      <pv-scroll-panel style="width: 100%; height: 250px" class="border-1 border-round-lg overflow-hidden"
           :class="submitted && selectedPermissions.length === 0 ? 'border-red-500' : 'border-100'">
        <div class="p-3 bg-50 flex flex-column gap-2">
          <div v-for="perm in permissions" :key="perm.id" 
               class="permission-item flex align-items-start gap-3 p-3 border-1 border-round-lg border-100 transition-all hover:border-primary-300 hover:shadow-1 surface-card"
               :class="{ 'border-primary-400 bg-primary-50': selectedPermissions.includes(perm.id) }">
            <pv-checkbox v-model="selectedPermissions" :value="perm.id" :inputId="perm.id" />
            <label :for="perm.id" class="flex flex-column cursor-pointer w-full">
              <span class="text-900 font-bold text-sm">{{ $t(perm.titleKey) }}</span>
              <span class="text-500 text-xs mt-1">{{ $t(perm.descKey) }}</span>
            </label>
          </div>
        </div>
      </pv-scroll-panel>
      <p class="text-500 text-xs mt-2">{{ $t('settings.roles.dialog.permissionsSelected', { count: selectedPermissions.length }) }}</p>
    </div>

    <div class="flex justify-content-end gap-3 mt-5">
      <pv-button :label="$t('settings.roles.dialog.cancel')" variant="text" class="p-button-secondary font-bold px-5" @click="emit('cancel')" />
      <pv-button :label="role ? $t('settings.roles.dialog.saveChanges') : $t('settings.roles.dialog.createRole')" class="p-button-primary border-round-lg font-bold px-6" 
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
.permission-item {
  transition: all 0.2s ease-in-out;
}
</style>
