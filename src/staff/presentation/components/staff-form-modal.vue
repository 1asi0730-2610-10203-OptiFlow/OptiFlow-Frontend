<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'close', 'saved'])

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  role: 'Optometrista',
  department: 'Clínica',
  entryDate: new Date().toLocaleDateString('es-PE')
})

const roleOptions = [
  { label: 'Optometrista', value: 'Optometrista' },
  { label: 'Óptico', value: 'Óptico' },
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Personal de Apoyo', value: 'Personal de Apoyo' }
]

const departmentOptions = [
  { label: 'Clínica', value: 'Clínica' },
  { label: 'Ventas', value: 'Ventas' },
  { label: 'Administración', value: 'Administración' }
]

const permissions = computed(() => {
  if (form.role === 'Optometrista') {
    return [
      { label: t('staff.addModal.permissions.fullAccess'), icon: 'pi pi-shield' },
      { label: t('staff.addModal.permissions.clinicalRecords'), icon: 'pi pi-shield' },
      { label: t('staff.addModal.permissions.prescriptions'), icon: 'pi pi-shield' }
    ]
  }
  return [{ label: t('staff.addModal.permissions.fullAccess'), icon: 'pi pi-shield' }]
})

function onSave() {
  const names = (form.fullName || '').split(' ')
  const firstName = names[0] || ''
  const lastName = names.slice(1).join(' ') || ''
  
  emit('saved', {
    firstName,
    lastName,
    email: form.email,
    role: form.role,
    department: form.department,
    employeeCode: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
    status: 'Activo',
    activeToday: true,
    photo: ''
  })
  
  // Reset form
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.role = 'Optometrista'
  form.department = 'Clínica'
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    @update:visible="(val) => emit('update:visible', val)"
    :style="{ width: '500px' }"
    class="staff-modal"
    :closable="true"
    :header="t('staff.addModal.title')"
  >
    <template #header>
      <div class="modal-header">
        <h2 class="modal-title">{{ t('staff.addModal.title') }}</h2>
        <p class="modal-subtitle">{{ t('staff.addModal.subtitle') }}</p>
      </div>
    </template>

    <div class="form-container">
      <div class="form-field">
        <label>{{ t('staff.addModal.fullName') }} *</label>
        <pv-input-text 
          v-model="form.fullName" 
          :placeholder="t('staff.addModal.placeholders.fullName')" 
          class="w-full"
        />
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>{{ t('staff.addModal.email') }} *</label>
          <pv-input-text 
            v-model="form.email" 
            :placeholder="t('staff.addModal.placeholders.email')" 
            class="w-full"
          />
        </div>
        <div class="form-field">
          <label>{{ t('staff.addModal.phone') }}</label>
          <pv-input-text 
            v-model="form.phone" 
            :placeholder="t('staff.addModal.placeholders.phone')" 
            class="w-full"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>{{ t('staff.addModal.role') }}</label>
          <pv-select 
            v-model="form.role" 
            :options="roleOptions" 
            option-label="label" 
            option-value="value" 
            class="w-full"
          />
        </div>
        <div class="form-field">
          <label>{{ t('staff.addModal.department') }}</label>
          <pv-select 
            v-model="form.department" 
            :options="departmentOptions" 
            option-label="label" 
            option-value="value" 
            class="w-full"
          />
        </div>
      </div>

      <div class="form-field">
        <label>{{ t('staff.addModal.entryDate') }}</label>
        <pv-input-text v-model="form.entryDate" class="w-full" />
      </div>

      <div class="permissions-section">
        <label class="permissions-label">{{ t('staff.addModal.defaultPermissions') }}</label>
        <div class="permissions-tags">
          <div v-for="p in permissions" :key="p.label" class="permission-tag">
             <i :class="p.icon" />
             {{ p.label }}
          </div>
        </div>
        <p class="permissions-note">{{ t('staff.addModal.permissionsNote') }}</p>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <pv-button 
          :label="t('common.cancel')" 
          class="btn-cancel p-button-outlined" 
          @click="emit('update:visible', false)" 
        />
        <pv-button 
          :label="t('staff.addModal.title')" 
          class="btn-save" 
          @click="onSave" 
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.staff-modal :deep(.p-dialog-header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.modal-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row > * {
  flex: 1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.w-full {
  width: 100%;
}

.permissions-section {
  background-color: #f0fdfa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.permissions-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.permissions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #99f6e4;
  color: #0d9488;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.permission-tag i {
  font-size: 0.7rem;
}

.permissions-note {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  width: 100%;
  padding-top: 12px;
}

.btn-cancel {
  flex: 1;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: #475569;
  border-color: #e2e8f0;
}

.btn-save {
  flex: 1;
  background-color: #00c1b0 !important;
  border: none !important;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: white;
}
</style>
