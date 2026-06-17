<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '../../application/staff.store.js'
import { useI18n } from 'vue-i18n'
import ContextMenu from 'primevue/contextmenu'
import StaffFormModal from '../components/staff-form-modal.vue'
import StaffDetailModal from '../components/staff-detail-modal.vue'

const store = useStaffStore()
const { t } = useI18n()

const search = ref('')
const departmentFilter = ref(null)
const roleFilter = ref(null)
const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedEmployee = ref(null)

const departmentOptions = computed(() => [
  { label: t('staff.allDepartments'), value: null },
  { label: t('staff.departments.clinic'), value: 'Clínica' },
  { label: t('staff.departments.sales'), value: 'Ventas' },
  { label: t('staff.departments.admin'), value: 'Administración' }
])

const roleOptions = computed(() => [
  { label: t('staff.allRoles'), value: null },
  { label: t('staff.roles.optometrist'), value: 'Optometrista' },
  { label: t('staff.roles.optician'), value: 'Óptico' },
  { label: t('staff.roles.admin'), value: 'Administrador' },
  { label: t('staff.roles.support'), value: 'Personal de Apoyo' }
])

const filteredStaff = computed(() => {
  let list = store.staff
  const term = search.value.toLowerCase()
  
  if (term) {
    list = list.filter(s => 
      s.fullName.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.role.toLowerCase().includes(term)
    )
  }
  
  if (departmentFilter.value) {
    list = list.filter(s => s.department === departmentFilter.value)
  }
  
  if (roleFilter.value) {
    list = list.filter(s => s.role === roleFilter.value)
  }
  
  return list
})

async function onEmployeeSaved(employee) {
  await store.createEmployee(employee)
  showAddModal.value = false
}

function onRowClick(event) {
  selectedEmployee.value = event.data
  showDetailModal.value = true
}

onMounted(() => {
  store.fetchStaff()
})

const getInitials = (name) => {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const getRoleTagStyle = (role) => {
  switch (role) {
    case 'Optometrista': return { backgroundColor: '#f5f3ff', color: '#8b5cf6' };
    case 'Óptico': return { backgroundColor: '#e0f2fe', color: '#0369a1' };
    case 'Administrador': return { backgroundColor: '#fee2e2', color: '#dc2626' };
    case 'Recepcionista': return { backgroundColor: '#f0fdf4', color: '#16a34a' };
    default: return { backgroundColor: '#f3f4f6', color: '#4b5563' };
  }
}

const getStatusTagStyle = (status) => {
  if (status === 'Activo') {
    return { backgroundColor: '#ecfdf5', color: '#10b981' };
  }
  return { backgroundColor: '#f9fafb', color: '#6b7280' };
}

// Right-click context menu
const contextMenuRef = ref(null)
const contextEmployee = ref(null)

const contextMenuItems = computed(() => [
  {
    label: t('staff.contextMenu.viewDetails'),
    icon: 'pi pi-user',
    command: () => { selectedEmployee.value = contextEmployee.value; showDetailModal.value = true }
  },
  { separator: true },
  {
    label: t('staff.contextMenu.copyEmail'),
    icon: 'pi pi-envelope',
    command: () => { navigator.clipboard.writeText(contextEmployee.value?.email || '') }
  },
  {
    label: t('staff.contextMenu.copyCode'),
    icon: 'pi pi-id-card',
    command: () => { navigator.clipboard.writeText(contextEmployee.value?.employeeCode || '') }
  }
])

function onRowContextMenu(event) {
  contextEmployee.value = event.data
  contextMenuRef.value.show(event.originalEvent)
}
</script>

<template>
  <div class="staff-list-page">
    <header class="page-header">
      <div class="page-header__left">
        <h1 class="page-title">{{ t('staff.pageTitle') }}</h1>
        <p class="page-subtitle">{{ t('staff.pageSubtitle') }}</p>
      </div>
      <div class="page-header__right">
        <pv-button class="btn-add-employee" severity="success" @click="showAddModal = true">
          <i class="pi pi-plus" />
          {{ t('staff.addEmployee') }}
        </pv-button>
      </div>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-body">
          <span class="kpi-label">{{ t('staff.kpi.totalEmployees') }}</span>
          <span class="kpi-value">{{ store.totalEmployees }}</span>
        </div>
        <div class="kpi-icon kpi-icon--teal">
          <i class="pi pi-users" />
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-body">
          <span class="kpi-label">{{ t('staff.kpi.optometrists') }}</span>
          <span class="kpi-value">{{ store.optometrists }}</span>
        </div>
        <div class="kpi-icon kpi-icon--purple">
          <i class="pi pi-shield" />
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-body">
          <span class="kpi-label">{{ t('staff.kpi.supportStaff') }}</span>
          <span class="kpi-value">{{ store.supportStaff }}</span>
        </div>
        <div class="kpi-icon kpi-icon--green">
          <i class="pi pi-user-plus" />
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-body">
          <span class="kpi-label">{{ t('staff.kpi.activeToday') }}</span>
          <span class="kpi-value">{{ store.activeTodayCount }}</span>
        </div>
        <div class="kpi-icon kpi-icon--orange">
          <i class="pi pi-user" />
        </div>
      </div>
    </div>

    <div class="filters-card">
      <div class="search-box">
        <i class="pi pi-search search-icon" />
        <pv-input-text v-model="search" :placeholder="t('staff.searchPlaceholder')" class="search-input" />
      </div>
      <div class="filters-group">
        <pv-select v-model="roleFilter" :options="roleOptions" option-label="label" option-value="value" class="filter-select" />
        <pv-select v-model="departmentFilter" :options="departmentOptions" option-label="label" option-value="value" class="filter-select" />
      </div>
    </div>

    <div class="table-card">
      <pv-data-table :value="filteredStaff" :loading="store.loading" data-key="id" class="staff-table" @row-click="onRowClick" @row-contextmenu="onRowContextMenu" row-hover>
        <pv-column field="fullName" :header="t('staff.table.employee')" style="min-width: 400px">
          <template #body="{ data }">
            <div class="employee-info">
              <div class="employee-avatar" :class="'avatar-' + (data.id % 5)">{{ getInitials(data.fullName) }}</div>
              <div class="employee-details">
                <span class="employee-name">{{ data.fullName }}</span>
                <span class="employee-meta">{{ data.employeeCode }} · {{ data.email }}</span>
              </div>
            </div>
          </template>
        </pv-column>

        <pv-column field="role" :header="t('staff.table.role')">
          <template #body="{ data }">
            <pv-tag :value="data.role" :style="getRoleTagStyle(data.role)" class="role-tag" />
          </template>
        </pv-column>

        <pv-column field="department" :header="t('staff.table.department')">
          <template #body="{ data }">
            <span class="department-text">{{ data.department }}</span>
          </template>
        </pv-column>

        <pv-column field="status" :header="t('staff.table.status')">
          <template #body="{ data }">
            <pv-tag :value="data.status" :style="getStatusTagStyle(data.status)" class="status-pill" />
          </template>
        </pv-column>

        <pv-column style="width: 3rem">
          <template #body>
            <i class="pi pi-chevron-right text-gray-300" />
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <staff-form-modal v-model:visible="showAddModal" @saved="onEmployeeSaved" />
    <staff-detail-modal v-model:visible="showDetailModal" :employee="selectedEmployee" />
    <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />
  </div>
</template>

<style scoped>
.staff-list-page { display: flex; flex-direction: column; gap: 24px; padding: 24px 32px; background: #fdfdfd; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.75rem; font-weight: 700; color: #1a202c; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: #718096; }
.btn-add-employee { background-color: #00c1b0 !important; border: none !important; border-radius: 8px; font-weight: 600; padding: 10px 20px; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.kpi-card { background: #fff; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
.kpi-label { font-size: 0.8rem; color: #94a3b8; font-family: 'Montserrat', sans-serif; }
.kpi-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
.kpi-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
.kpi-icon--teal { background: #f0fdfa; color: #00c1b0; }
.kpi-icon--purple { background: #f5f3ff; color: #7c3aed; }
.kpi-icon--green { background: #f0fdf4; color: #10b981; }
.kpi-icon--orange { background: #fff7ed; color: #f97316; }

.filters-card { background: white; padding: 16px 20px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; gap: 20px; border: 1px solid #f1f5f9; }
.search-box { position: relative; flex: 1; max-width: 400px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { width: 100%; padding-left: 40px !important; border-radius: 10px; background: #f8fafc; }
.filters-group { display: flex; gap: 12px; }
.filter-select { min-width: 180px; border-radius: 10px; background: #f8fafc; }

.table-card { background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; }
:deep(.staff-table .p-datatable-thead > tr > th) { background: #fff; color: #94a3b8; font-size: 0.75rem; font-weight: 600; padding: 16px 24px; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
:deep(.staff-table .p-datatable-tbody > tr > td) { padding: 16px 24px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.employee-info { display: flex; align-items: center; gap: 14px; }
.employee-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; }
.avatar-0 { background-color: #00c1b0; }
.avatar-1 { background-color: #2563eb; }
.avatar-2 { background-color: #7c3aed; }
.avatar-3 { background-color: #db2777; }
.avatar-4 { background-color: #ea580c; }
.employee-name { font-weight: 600; color: #1e293b; display: block; }
.employee-meta { font-size: 0.8rem; color: #94a3b8; }
.role-tag { font-weight: 600; font-size: 0.75rem; padding: 4px 12px; border-radius: 20px; border: none !important; }
.department-text { font-size: 0.9rem; color: #64748b; font-weight: 500; }
.status-pill { font-weight: 600; font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; border: none !important; }
.text-gray-300 { color: #cbd5e1; }
</style>
