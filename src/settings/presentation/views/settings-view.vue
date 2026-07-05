<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RolesApi } from '../../infrastructure/roles-api.js';
import { eventBus } from '../../../shared/infrastructure/event-bus.js';
import { isValidEmail, isValidPhone } from '../../../shared/presentation/utils/validators.js';
import { RoleAssembler } from '../../infrastructure/role.assembler.js';
import RoleListItem from '../components/role-list-item.vue';
import RolesSummary from '../components/roles-summary.vue';
import SystemStatus from '../components/system-status.vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import RoleForm from '../components/role-form.vue';

const roles = ref([]);
const rolesApi = new RolesApi();
const loading = ref(true);
const toast = useToast();
const confirm = useConfirm();
const showEditDialog = ref(false);
const showAddDialog = ref(false);
const selectedRoleToEdit = ref(null);

const handleEditRoleClick = (role) => {
  selectedRoleToEdit.value = role;
  showEditDialog.value = true;
};

const handleUpdateRole = async (updatedRoleData) => {
  try {
    loading.value = true;
    
    // Prepare data for DB
    const roleToSave = {
      id: selectedRoleToEdit.value.id,
      role_id: selectedRoleToEdit.value.id,
      name: selectedRoleToEdit.value.internalName || selectedRoleToEdit.value.name.toUpperCase().replace(/\s+/g, '_'),
      displayName: updatedRoleData.name,
      description: selectedRoleToEdit.value.description || 'Rol personalizado',
      color: updatedRoleData.color,
      permissions: updatedRoleData.permissions
    };
    
    await rolesApi.update(selectedRoleToEdit.value.id, roleToSave);
    showEditDialog.value = false;
    toast.add({ severity: 'success', summary: t('settings.toast.success'), detail: t('settings.toast.roleUpdated'), life: 3000 });
    await fetchData();
  } catch (error) {
    toast.add({ severity: 'error', summary: t('settings.toast.error'), detail: t('settings.toast.roleUpdateFailed'), life: 3000 });
    console.error('Error updating role:', error);
  } finally {
    loading.value = false;
  }
};

const { t, locale } = useI18n();

const businessData = ref({ name: '', address: '', phone: '', email: '' });
const securityData = ref({ twoFactor: 'ENABLED', autoLogout: '30m', passwordPolicy: 'STRONG', dataEncryption: 'AES256' });
const backupsData = ref({ frequency: 'DAILY', time: '02:00 a. m.', retention: 90, automatic: '', lastBackup: '', storage: '', nextBackup: '' });

const showBusinessDialog = ref(false);
const showSecurityDialog = ref(false);
const showBackupDialog = ref(false);

const businessForm = ref({ name: '', address: '', phone: '', email: '' });
const businessErrors = ref({});

const validateBusinessForm = () => {
  const e = {};
  if (businessForm.value.phone.trim() && !isValidPhone(businessForm.value.phone)) e.phoneFormat = true;
  if (businessForm.value.email.trim() && !isValidEmail(businessForm.value.email)) e.emailFormat = true;
  businessErrors.value = e;
  return Object.keys(e).length === 0;
};
const securityForm = ref({ twoFactor: '', autoLogout: '', passwordPolicy: '', dataEncryption: '' });
const backupsForm = ref({ frequency: '', time: '', retention: 90 });

const openEditBusinessDialog = () => {
  businessForm.value = { ...businessData.value };
  businessErrors.value = {};
  showBusinessDialog.value = true;
};

const openEditSecurityDialog = () => {
  securityForm.value = { ...securityData.value };
  showSecurityDialog.value = true;
};

const openEditBackupDialog = () => {
  backupsForm.value = {
    frequency: backupsData.value.frequency,
    time: backupsData.value.time,
    retention: backupsData.value.retention
  };
  showBackupDialog.value = true;
};

const fetchSettingsData = async () => {
  // Business info comes from the real optic account; security/backup are informational defaults
  // (the app doesn't manage those on the backend).
  try {
    const account = await rolesApi.getBusiness();
    if (account && account.name) {
      businessData.value = { ...businessData.value, name: account.name };
    }
  } catch (error) {
    console.error('Error fetching optic info:', error);
  }
};

const handleUpdateBusiness = async () => {
  if (!validateBusinessForm()) return;
  try {
    loading.value = true;
    await rolesApi.http.put('/business/1', businessForm.value);
    showBusinessDialog.value = false;
    toast.add({ severity: 'success', summary: t('settings.toast.success'), detail: t('settings.toast.businessUpdated'), life: 3000 });
    await fetchSettingsData();
  } catch (error) {
    toast.add({ severity: 'error', summary: t('settings.toast.error'), detail: t('settings.toast.updateFailed'), life: 3000 });
    console.error('Error updating business info:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpdateSecurity = async () => {
  try {
    loading.value = true;
    await rolesApi.http.put('/security/1', securityForm.value);
    showSecurityDialog.value = false;
    toast.add({ severity: 'success', summary: t('settings.toast.success'), detail: t('settings.toast.securityUpdated'), life: 3000 });
    await fetchSettingsData();
  } catch (error) {
    toast.add({ severity: 'error', summary: t('settings.toast.error'), detail: t('settings.toast.updateFailed'), life: 3000 });
    console.error('Error updating security settings:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpdateBackup = async () => {
  try {
    loading.value = true;
    const backupToSave = {
      ...backupsData.value,
      frequency: backupsForm.value.frequency,
      time: backupsForm.value.time,
      retention: Number(backupsForm.value.retention)
    };
    await rolesApi.http.put('/backups/1', backupToSave);
    showBackupDialog.value = false;
    toast.add({ severity: 'success', summary: t('settings.toast.success'), detail: t('settings.toast.backupUpdated'), life: 3000 });
    await fetchSettingsData();
  } catch (error) {
    toast.add({ severity: 'error', summary: t('settings.toast.error'), detail: t('settings.toast.updateFailed'), life: 3000 });
    console.error('Error updating backup settings:', error);
  } finally {
    loading.value = false;
  }
};

const businessInfo = computed(() => [
  { labelKey: 'settings.business.name',    value: businessData.value.name },
  { labelKey: 'settings.business.address', value: businessData.value.address },
  { labelKey: 'settings.business.phone',   value: businessData.value.phone },
  { labelKey: 'settings.business.email',   value: businessData.value.email }
]);

const securityInfo = computed(() => {
  const twoFactorKey = securityData.value.twoFactor === 'ENABLED' ? 'settings.security.enabled' : 'settings.security.disabled';
  
  let logoutKey = 'settings.security.autoLogout30';
  if (securityData.value.autoLogout === '15m') logoutKey = 'settings.security.autoLogout15';
  else if (securityData.value.autoLogout === '60m') logoutKey = 'settings.security.autoLogout60';

  let policyKey = 'settings.security.passwordPolicyStrong';
  if (securityData.value.passwordPolicy === 'MEDIUM') policyKey = 'settings.security.passwordPolicyMedium';
  else if (securityData.value.passwordPolicy === 'BASIC') policyKey = 'settings.security.passwordPolicyBasic';

  let encKey = 'settings.security.encryptionAes';
  if (securityData.value.dataEncryption === 'DES') encKey = 'settings.security.encryptionDes';
  else if (securityData.value.dataEncryption === 'NONE') encKey = 'settings.security.encryptionNone';

  return [
    { labelKey: 'settings.security.twoFactor',       valueKey: twoFactorKey },
    { labelKey: 'settings.security.autoLogout',      valueKey: logoutKey },
    { labelKey: 'settings.security.passwordPolicy',  valueKey: policyKey },
    { labelKey: 'settings.security.dataEncryption',  valueKey: encKey }
  ];
});

const backupInfo = computed(() => {
  const retentionVal = locale.value === 'es' 
    ? `${backupsData.value.retention} días` 
    : `${backupsData.value.retention} days`;
  
  return [
    { labelKey: 'settings.backup.automatic',   value: backupsData.value.automatic },
    { labelKey: 'settings.backup.retention',   value: retentionVal },
    { labelKey: 'settings.backup.lastBackup',  value: backupsData.value.lastBackup },
    { labelKey: 'settings.backup.storage',     value: backupsData.value.storage },
    { labelKey: 'settings.backup.nextBackup',  value: backupsData.value.nextBackup }
  ];
});

const twoFactorOptions = computed(() => [
  { label: t('settings.security.options.enabled'), value: 'ENABLED' },
  { label: t('settings.security.options.disabled'), value: 'DISABLED' }
]);

const autoLogoutOptions = computed(() => [
  { label: t('settings.security.options.logout15'), value: '15m' },
  { label: t('settings.security.options.logout30'), value: '30m' },
  { label: t('settings.security.options.logout60'), value: '60m' }
]);

const passwordPolicyOptions = computed(() => [
  { label: t('settings.security.options.policyStrong'), value: 'STRONG' },
  { label: t('settings.security.options.policyMedium'), value: 'MEDIUM' },
  { label: t('settings.security.options.policyBasic'), value: 'BASIC' }
]);

const dataEncryptionOptions = computed(() => [
  { label: t('settings.security.options.encryptionAes'), value: 'AES256' },
  { label: t('settings.security.options.encryptionDes'), value: 'DES' },
  { label: t('settings.security.options.encryptionNone'), value: 'NONE' }
]);

const backupFrequencyOptions = computed(() => [
  { label: t('settings.backup.options.daily'), value: 'DAILY' },
  { label: t('settings.backup.options.weekly'), value: 'WEEKLY' },
  { label: t('settings.backup.options.monthly'), value: 'MONTHLY' },
  { label: t('settings.backup.options.annually'), value: 'ANNUALLY' }
]);

// Roles are derived from the real staff's job roles (the backend has no RBAC — the actual user
// role model is just Admin/Client), so this shows real people grouped by their role.
function deriveRolesFromStaff(staff) {
  const palette = ['#00c1b0', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
  const counts = {};
  for (const s of (staff || [])) {
    const name = (s.role && s.role.trim()) ? s.role.trim() : 'Sin rol asignado';
    counts[name] = (counts[name] || 0) + 1;
  }
  return Object.entries(counts).map(([name, userCount], i) => ({
    id: i + 1,
    name,
    description: `${userCount} ${userCount === 1 ? 'miembro' : 'miembros'} del personal`,
    userCount,
    color: palette[i % palette.length],
    permissions: []
  }));
}

const fetchData = async () => {
  try {
    loading.value = true;
    const staff = await rolesApi.getEmployees().catch(() => []);
    roles.value = deriveRolesFromStaff(staff);
    await fetchSettingsData();
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
      name: newRoleData.name.toUpperCase().replace(/\s+/g, '_'), // Internal name
      displayName: newRoleData.name,
      description: newRoleData.description || 'Nuevo rol personalizado',
      color: newRoleData.color,
      permissions: newRoleData.permissions
    };
    
    await rolesApi.create(roleToSave);
    showAddDialog.value = false;
    toast.add({ severity: 'success', summary: t('settings.toast.success'), detail: t('settings.toast.roleCreated'), life: 3000 });
    await fetchData();
  } catch (error) {
    toast.add({ severity: 'error', summary: t('settings.toast.error'), detail: t('settings.toast.roleCreateFailed'), life: 3000 });
    console.error('Error saving role:', error);
  } finally {
    loading.value = false;
  }
};

const handleDeleteRoleClick = (role) => {
  confirm.require({
    message: t('settings.roles.confirm.deleteMessage', { name: role.name }),
    header: t('settings.roles.confirm.deleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('settings.roles.confirm.deleteAccept'),
    rejectLabel: t('common.cancel'),
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        loading.value = true;
        await rolesApi.delete(role.id);
        toast.add({ severity: 'success', summary: t('settings.toast.success'), detail: t('settings.toast.roleDeleted'), life: 3000 });
        await fetchData();
      } catch (error) {
        toast.add({ severity: 'error', summary: t('settings.toast.error'), detail: t('settings.toast.roleDeleteFailed'), life: 3000 });
        console.error('Error deleting role:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

let unsubAddRole, unsubBusiness, unsubSecurity, unsubBackup
onMounted(() => {
  fetchData();
  unsubAddRole  = eventBus.on('ui:open:add-role',       () => { showAddDialog.value = true })
  unsubBusiness = eventBus.on('ui:open:business-info',  () => openEditBusinessDialog())
  unsubSecurity = eventBus.on('ui:open:security',       () => openEditSecurityDialog())
  unsubBackup   = eventBus.on('ui:open:backup',         () => openEditBackupDialog())
})
onUnmounted(() => {
  unsubAddRole?.(); unsubBusiness?.(); unsubSecurity?.(); unsubBackup?.()
})
</script>

<template>
  <div class="settings-container p-4 lg:p-6">
    <pv-toast />
    <pv-confirm-dialog />
    <header class="mb-6">
      <h1 class="text-900 font-bold text-3xl lg:text-4xl mb-2 mt-0 font-josefin">{{ $t('settings.pageTitle') }}</h1>
      <p class="text-600 text-lg m-0">{{ $t('settings.pageSubtitle') }}</p>
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
                  <h2 class="text-900 font-bold text-xl lg:text-2xl m-0 font-josefin">{{ $t('settings.roles.title') }}</h2>
                  <p class="text-500 m-0 text-sm lg:text-base">{{ $t('settings.roles.subtitle') }}</p>
                </div>
              </div>
              <pv-button :label="$t('settings.roles.addRole')" icon="pi pi-plus" class="p-button-primary border-round-lg font-bold px-4" 
                         style="background-color: #00c1b0; border-color: #00c1b0" @click="showAddDialog = true" />
            </div>

            <div v-if="loading" class="flex justify-content-center py-8">
              <pv-progress-spinner style="width: 50px; height: 50px" />
            </div>
            <div v-else class="roles-list">
              <RoleListItem v-for="role in roles" :key="role.id" :role="role" @edit="handleEditRoleClick" @delete="handleDeleteRoleClick" />
            </div>
          </template>
        </pv-card>

        <!-- Información del Negocio -->
        <pv-card class="shadow-1 border-none mt-4">
          <template #content>
            <div class="flex align-items-center gap-3 mb-5 pb-4 border-bottom-1 border-100">
              <div class="icon-header flex align-items-center justify-content-center border-round-md"
                   style="background-color: #6366f115; color: #6366f1; width: 48px; height: 48px; border: 1px solid #6366f130">
                <i class="pi pi-building text-2xl"></i>
              </div>
              <div>
                <h2 class="text-900 font-bold text-xl lg:text-2xl m-0 font-josefin">{{ $t('settings.business.title') }}</h2>
              </div>
            </div>
            <div class="flex flex-column gap-0">
              <div v-for="item in businessInfo" :key="item.labelKey"
                   class="flex align-items-center justify-content-between py-3 border-bottom-1 border-100">
                <span class="text-600 text-sm">{{ $t(item.labelKey) }}</span>
                <span class="text-900 font-semibold text-sm">{{ item.value }}</span>
              </div>
            </div>
            <pv-button :label="$t('settings.modifySettings')" icon="pi pi-pencil" class="w-full mt-4 border-round-lg font-bold"
                       style="background-color: #00c1b0; border-color: #00c1b0" @click="openEditBusinessDialog" />
          </template>
        </pv-card>

        <!-- Seguridad -->
        <pv-card class="shadow-1 border-none mt-4">
          <template #content>
            <div class="flex align-items-center gap-3 mb-5 pb-4 border-bottom-1 border-100">
              <div class="icon-header flex align-items-center justify-content-center border-round-md"
                   style="background-color: #f9737315; color: #e53e3e; width: 48px; height: 48px; border: 1px solid #f9737330">
                <i class="pi pi-lock text-2xl"></i>
              </div>
              <div>
                <h2 class="text-900 font-bold text-xl lg:text-2xl m-0 font-josefin">{{ $t('settings.security.title') }}</h2>
              </div>
            </div>
            <div class="flex flex-column gap-0">
              <div v-for="item in securityInfo" :key="item.labelKey"
                   class="flex align-items-center justify-content-between py-3 border-bottom-1 border-100">
                <span class="text-600 text-sm">{{ $t(item.labelKey) }}</span>
                <span class="text-900 font-semibold text-sm">{{ $t(item.valueKey) }}</span>
              </div>
            </div>
            <pv-button :label="$t('settings.modifySettings')" icon="pi pi-pencil" class="w-full mt-4 border-round-lg font-bold"
                       style="background-color: #00c1b0; border-color: #00c1b0" @click="openEditSecurityDialog" />
          </template>
        </pv-card>

        <!-- Datos y Copias de Seguridad -->
        <pv-card class="shadow-1 border-none mt-4">
          <template #content>
            <div class="flex align-items-center gap-3 mb-5 pb-4 border-bottom-1 border-100">
              <div class="icon-header flex align-items-center justify-content-center border-round-md"
                   style="background-color: #38a16915; color: #38a169; width: 48px; height: 48px; border: 1px solid #38a16930">
                <i class="pi pi-database text-2xl"></i>
              </div>
              <div>
                <h2 class="text-900 font-bold text-xl lg:text-2xl m-0 font-josefin">{{ $t('settings.backup.title') }}</h2>
              </div>
            </div>
            <div class="flex flex-column gap-0">
              <div v-for="item in backupInfo" :key="item.labelKey"
                   class="flex align-items-center justify-content-between py-3 border-bottom-1 border-100">
                <span class="text-600 text-sm">{{ $t(item.labelKey) }}</span>
                <span class="text-900 font-semibold text-sm">{{ item.value }}</span>
              </div>
            </div>
            <pv-button :label="$t('settings.modifySettings')" icon="pi pi-pencil" class="w-full mt-4 border-round-lg font-bold"
                       style="background-color: #00c1b0; border-color: #00c1b0" @click="openEditBackupDialog" />
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
    <pv-dialog v-model:visible="showAddDialog" modal :header="$t('settings.roles.dialog.title')" :style="{ width: '500px' }" class="p-fluid">
      <template #header>
        <div class="flex flex-column gap-1">
          <h2 class="m-0 font-josefin text-xl font-bold">{{ $t('settings.roles.dialog.title') }}</h2>
          <span class="text-500 text-sm">{{ $t('settings.roles.dialog.subtitle') }}</span>
        </div>
      </template>
      <RoleForm @save="handleSaveRole" @cancel="showAddDialog = false" />
    </pv-dialog>

    <!-- Edit Role Dialog -->
    <pv-dialog v-model:visible="showEditDialog" modal :style="{ width: '500px' }" class="p-fluid">
      <template #header>
        <div class="flex flex-column gap-1">
          <h2 class="m-0 font-josefin text-xl font-bold">{{ $t('settings.roles.dialog.editTitle', { name: selectedRoleToEdit?.name }) }}</h2>
          <span class="text-500 text-sm">{{ $t('settings.roles.listItem.usersAssigned', { count: selectedRoleToEdit?.userCount }) }}</span>
        </div>
      </template>
      <RoleForm v-if="showEditDialog" :role="selectedRoleToEdit" @save="handleUpdateRole" @cancel="showEditDialog = false" />
    </pv-dialog>

    <!-- Edit Business Info Dialog -->
    <pv-dialog v-model:visible="showBusinessDialog" modal :style="{ width: '500px' }" class="p-fluid">
      <template #header>
        <div class="flex align-items-center gap-3">
          <div class="flex align-items-center justify-content-center border-round-md"
               style="background-color: #6366f115; color: #6366f1; width: 40px; height: 40px; border: 1px solid #6366f130">
            <i class="pi pi-building text-lg"></i>
          </div>
          <div class="flex flex-column gap-1">
            <h2 class="m-0 font-josefin text-xl font-bold text-900 line-height-2">{{ $t('settings.business.title') }}</h2>
            <span class="text-500 text-sm m-0 line-height-2">{{ $t('settings.business.subtitle') }}</span>
          </div>
        </div>
      </template>
      <div class="mt-2">
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.business.nameLabel') }}</label>
          <pv-input-text v-model="businessForm.name" class="w-full border-round-lg p-3" />
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.business.addressLabel') }}</label>
          <pv-input-text v-model="businessForm.address" class="w-full border-round-lg p-3" />
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.business.phoneLabel') }}</label>
          <pv-input-text
            v-model="businessForm.phone"
            class="w-full border-round-lg p-3"
            :class="{ 'p-invalid': businessErrors.phoneFormat }"
            @input="businessErrors.phoneFormat = false"
          />
          <span v-if="businessErrors.phoneFormat" class="field-error">
            {{ $t('settings.business.phoneInvalid') }}
          </span>
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.business.emailLabel') }}</label>
          <pv-input-text
            v-model="businessForm.email"
            class="w-full border-round-lg p-3"
            :class="{ 'p-invalid': businessErrors.emailFormat }"
            @input="businessErrors.emailFormat = false"
          />
          <span v-if="businessErrors.emailFormat" class="field-error">
            {{ $t('settings.business.emailInvalid') }}
          </span>
        </div>
        <div class="flex justify-content-end gap-3 mt-5">
          <pv-button :label="$t('settings.business.cancel')" variant="text" class="p-button-secondary font-bold px-5" @click="showBusinessDialog = false" />
          <pv-button :label="$t('settings.business.saveChanges')" class="p-button-primary border-round-lg font-bold px-6" 
                     style="background-color: #00c1b0; border-color: #00c1b0" @click="handleUpdateBusiness" />
        </div>
      </div>
    </pv-dialog>

    <!-- Edit Security Settings Dialog -->
    <pv-dialog v-model:visible="showSecurityDialog" modal :style="{ width: '500px' }" class="p-fluid">
      <template #header>
        <div class="flex align-items-center gap-3">
          <div class="flex align-items-center justify-content-center border-round-md"
               style="background-color: #f9737315; color: #e53e3e; width: 40px; height: 40px; border: 1px solid #f9737330">
            <i class="pi pi-lock text-lg"></i>
          </div>
          <div class="flex flex-column gap-1">
            <h2 class="m-0 font-josefin text-xl font-bold text-900 line-height-2">{{ $t('settings.security.dialogTitle') }}</h2>
            <span class="text-500 text-sm m-0 line-height-2">{{ $t('settings.security.subtitle') }}</span>
          </div>
        </div>
      </template>
      <div class="mt-2">
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.security.twoFactor') }}</label>
          <pv-select v-model="securityForm.twoFactor" :options="twoFactorOptions" optionLabel="label" optionValue="value" class="w-full border-round-lg p-1" />
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.security.autoLogout') }}</label>
          <pv-select v-model="securityForm.autoLogout" :options="autoLogoutOptions" optionLabel="label" optionValue="value" class="w-full border-round-lg p-1" />
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.security.passwordPolicy') }}</label>
          <pv-select v-model="securityForm.passwordPolicy" :options="passwordPolicyOptions" optionLabel="label" optionValue="value" class="w-full border-round-lg p-1" />
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.security.dataEncryption') }}</label>
          <pv-select v-model="securityForm.dataEncryption" :options="dataEncryptionOptions" optionLabel="label" optionValue="value" class="w-full border-round-lg p-1" />
        </div>
        
        <div class="bg-blue-50 text-blue-800 p-3 border-round-lg mb-4 text-xs font-semibold flex align-items-start gap-2 line-height-3" style="border: 1px solid #3b82f630">
          <i class="pi pi-info-circle text-sm mt-1"></i>
          <span>{{ $t('settings.security.warningNote') }}</span>
        </div>

        <div class="flex justify-content-end gap-3 mt-5">
          <pv-button :label="$t('settings.business.cancel')" variant="text" class="p-button-secondary font-bold px-5" @click="showSecurityDialog = false" />
          <pv-button :label="$t('settings.business.saveChanges')" class="p-button-primary border-round-lg font-bold px-6" 
                     style="background-color: #00c1b0; border-color: #00c1b0" @click="handleUpdateSecurity" />
        </div>
      </div>
    </pv-dialog>

    <!-- Edit Backup Settings Dialog -->
    <pv-dialog v-model:visible="showBackupDialog" modal :style="{ width: '500px' }" class="p-fluid">
      <template #header>
        <div class="flex align-items-center gap-3">
          <div class="flex align-items-center justify-content-center border-round-md"
               style="background-color: #38a16915; color: #38a169; width: 40px; height: 40px; border: 1px solid #38a16930">
            <i class="pi pi-database text-lg"></i>
          </div>
          <div class="flex flex-column gap-1">
            <h2 class="m-0 font-josefin text-xl font-bold text-900 line-height-2">{{ $t('settings.backup.dialogTitle') }}</h2>
            <span class="text-500 text-sm m-0 line-height-2">{{ $t('settings.backup.subtitle') }}</span>
          </div>
        </div>
      </template>
      <div class="mt-2">
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.backup.frequencyLabel') }}</label>
          <pv-select v-model="backupsForm.frequency" :options="backupFrequencyOptions" optionLabel="label" optionValue="value" class="w-full border-round-lg p-1" />
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.backup.timeLabel') }}</label>
          <pv-input-text v-model="backupsForm.time" class="w-full border-round-lg p-3" />
        </div>
        <div class="mb-4">
          <label class="block text-900 font-medium mb-2 font-josefin">{{ $t('settings.backup.retentionLabel') }}</label>
          <pv-input-number v-model="backupsForm.retention" showButtons :min="1" class="w-full border-round-lg" inputClass="p-3" />
        </div>
        
        <div class="bg-green-50 text-green-800 p-3 border-round-lg mb-4 text-xs font-semibold flex align-items-start gap-2 line-height-3" style="border: 1px solid #38a16930">
          <i class="pi pi-check-circle text-sm mt-1"></i>
          <span>{{ $t('settings.backup.successNote') }}</span>
        </div>

        <div class="flex justify-content-end gap-3 mt-5">
          <pv-button :label="$t('settings.business.cancel')" variant="text" class="p-button-secondary font-bold px-5" @click="showBackupDialog = false" />
          <pv-button :label="$t('settings.backup.save')" class="p-button-primary border-round-lg font-bold px-6" 
                     style="background-color: #00c1b0; border-color: #00c1b0" @click="handleUpdateBackup" />
        </div>
      </div>
    </pv-dialog>
  </div>
</template>

<style scoped>
.field-error {
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  color: #dc2626;
  margin-top: 6px;
}

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
