<script setup>
import { reactive, computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isValidEmail, isValidPhone } from '../../../shared/presentation/utils/validators.js'
import { useRoles } from '../../../settings/application/use-roles.js'

const { t } = useI18n()

const props = defineProps({
  visible: Boolean,
  employee: {
    type: Object,
    default: null
  }
})

const isEditMode = computed(() => !!props.employee)

const emit = defineEmits(['update:visible', 'close', 'saved'])

const { roleOptions, fetchRoles, findRoleByName } = useRoles()

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  role: '',
  department: 'Clínica',
  entryDate: new Date().toLocaleDateString('es-PE'),
  status: 'Activo'
})

const defaultRole = computed(() => roleOptions.value[0]?.value || '')

onMounted(async () => {
  await fetchRoles()
  if (!form.role) form.role = props.employee?.role || defaultRole.value
})

const departmentOptions = [
  { label: 'Clínica', value: 'Clínica' },
  { label: 'Ventas', value: 'Ventas' },
  { label: 'Administración', value: 'Administración' }
]

const statusOptions = computed(() => [
  { label: t('staff.status.active'), value: 'Activo' },
  { label: t('staff.status.inactive'), value: 'Inactivo' }
])

const permissions = computed(() => {
  const role = findRoleByName(form.role)
  if (!role?.permissions?.length) {
    return [{ label: t('staff.addModal.permissions.fullAccess'), icon: 'pi pi-shield' }]
  }
  return role.permissions.map(id => ({
    label: t(`settings.roles.permissions.${id}.title`),
    icon: 'pi pi-shield'
  }))
})

const errors = ref({})
const submitted = ref(false)

function validate() {
  const e = {}
  if (!form.fullName.trim()) e.fullName = true
  if (!form.email.trim()) e.email = true
  else if (!isValidEmail(form.email)) e.emailFormat = true
  if (!form.phone.trim()) e.phone = true
  else if (!isValidPhone(form.phone)) e.phoneFormat = true
  errors.value = e
  return Object.keys(e).length === 0
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function onSave() {
  submitted.value = true
  if (!validate()) return

  const names = (form.fullName || '').split(' ')
  const firstName = names[0] || ''
  const lastName = names.slice(1).join(' ') || ''
  
  const payload = {
    firstName,
    lastName,
    email: form.email,
    phone: form.phone,
    role: form.role,
    department: form.department,
    entryDate: form.entryDate,
    employeeCode: isEditMode.value ? props.employee.employeeCode : 'EMP-' + Math.floor(1000 + Math.random() * 9000),
    status: isEditMode.value ? form.status : 'Activo',
    activeToday: isEditMode.value ? props.employee.activeToday : true,
    photo: isEditMode.value ? props.employee.photo : ''
  }

  if (isEditMode.value) {
    payload.id = props.employee.id
  }

  emit('saved', payload)

  // Reset form
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.role = defaultRole.value
  form.department = 'Clínica'
}

watch(() => props.employee, (emp) => {
  if (emp) {
    form.fullName = emp.fullName || ''
    form.email = emp.email || ''
    form.phone = emp.phone || ''
    form.role = emp.role || defaultRole.value
    form.department = emp.department || 'Clínica'
    form.entryDate = emp.entryDate || new Date().toLocaleDateString('es-PE')
    form.status = emp.status || 'Activo'
  } else {
    form.fullName = ''
    form.email = ''
    form.phone = ''
    form.role = defaultRole.value
    form.department = 'Clínica'
    form.entryDate = new Date().toLocaleDateString('es-PE')
    form.status = 'Activo'
  }
  errors.value = {}
  submitted.value = false
}, { immediate: true })
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    @update:visible="(val) => emit('update:visible', val)"
    :style="{ width: '500px' }"
    class="staff-modal"
    :closable="true"
    :header="isEditMode ? t('staff.editModal.title') : t('staff.addModal.title')"
  >
    <template #header>
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditMode ? t('staff.editModal.title') : t('staff.addModal.title') }}</h2>
        <p class="modal-subtitle">{{ isEditMode ? t('staff.editModal.subtitle') : t('staff.addModal.subtitle') }}</p>
      </div>
    </template>

    <div class="form-container">
      <div class="form-field">
        <label>{{ t('staff.addModal.fullName') }} *</label>
        <pv-input-text 
          v-model="form.fullName" 
          :placeholder="t('staff.addModal.placeholders.fullName')" 
          class="w-full"
          :class="{ 'p-invalid': errors.fullName }"
          @input="errors.fullName = false"
        />
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>{{ t('staff.addModal.email') }} *</label>
          <pv-input-text
            v-model="form.email"
            :placeholder="t('staff.addModal.placeholders.email')"
            class="w-full"
            :class="{ 'p-invalid': errors.email || errors.emailFormat }"
            @input="errors.email = false; errors.emailFormat = false"
          />
          <span v-if="errors.email" class="field-error">
            {{ $t('common.requiredError') }}
          </span>
          <span v-else-if="errors.emailFormat" class="field-error">
            {{ $t('staff.addModal.emailInvalid') }}
          </span>
        </div>
        <div class="form-field">
          <label>{{ t('staff.addModal.phone') }} *</label>
          <pv-input-text
            v-model="form.phone"
            :placeholder="t('staff.addModal.placeholders.phone')"
            class="w-full"
            :class="{ 'p-invalid': errors.phone || errors.phoneFormat }"
            @input="errors.phone = false; errors.phoneFormat = false"
          />
          <span v-if="errors.phone" class="field-error">
            {{ $t('common.fieldRequired') }}
          </span>
          <span v-else-if="errors.phoneFormat" class="field-error">
            {{ $t('staff.addModal.phoneInvalid') }}
          </span>
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

      <div class="form-row">
        <div class="form-field">
          <label>{{ t('staff.addModal.entryDate') }}</label>
          <pv-input-text v-model="form.entryDate" class="w-full" />
        </div>
        <div class="form-field" v-if="isEditMode">
          <label>{{ t('staff.editModal.status') }}</label>
          <pv-select
            v-model="form.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
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

      <p v-if="submitted && hasErrors" style="color: #dc2626; font-size: 0.8rem; font-family: Montserrat; margin: 0;">
        {{ $t('common.requiredError') }}
      </p>
    </div>

    <template #footer>
      <div class="modal-footer">
        <pv-button 
          :label="t('common.cancel')" 
          class="btn-cancel p-button-outlined" 
          @click="emit('update:visible', false)" 
        />
        <pv-button 
          :label="isEditMode ? t('staff.editModal.save') : t('staff.addModal.title')" 
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

.field-error {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.74rem;
  color: #dc2626;
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
