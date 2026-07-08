<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoles } from '../../../settings/application/use-roles.js'

const { t } = useI18n()
const { fetchRoles, getRoleTagStyle } = useRoles()

const props = defineProps({
  visible: Boolean,
  employee: Object
})

const emit = defineEmits(['update:visible', 'edit', 'delete'])

onMounted(fetchRoles)

const initials = computed(() => {
  if (!props.employee) return ''
  return props.employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    @update:visible="(val) => emit('update:visible', val)"
    :style="{ width: '450px' }"
    class="staff-detail-modal"
    :closable="true"
    :header="t('staff.table.employee')"
  >
    <div v-if="employee" class="detail-container">
      <div class="detail-header">
        <div class="detail-avatar" :class="'avatar-' + (employee.id % 5)">
          {{ initials }}
        </div>
        <div class="detail-title-group">
          <h2 class="detail-name">{{ employee.fullName }}</h2>
          <pv-tag 
            :value="employee.role" 
            :style="getRoleTagStyle(employee.role)"
            class="detail-role-tag"
          />
        </div>
      </div>

      <div class="detail-sections">
        <div class="detail-section">
          <h3 class="section-title">{{ t('staff.detailModal.personalInfo') }}</h3>
          <div class="detail-row">
            <span class="detail-label">{{ t('staff.detailModal.email') }}</span>
            <span class="detail-value">{{ employee.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('staff.detailModal.phone') }}</span>
            <span class="detail-value">{{ employee.phone || t('staff.detailModal.notRegistered') }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">{{ t('staff.detailModal.workDetails') }}</h3>
          <div class="detail-row">
            <span class="detail-label">{{ t('staff.detailModal.code') }}</span>
            <span class="detail-value font-mono">{{ employee.employeeCode }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('staff.detailModal.department') }}</span>
            <span class="detail-value">{{ employee.department }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('staff.detailModal.entryDate') }}</span>
            <span class="detail-value">{{ employee.entryDate || t('staff.detailModal.notRegistered') }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('staff.detailModal.status') }}</span>
            <div class="status-badge">
              <span class="status-dot"></span>
              {{ employee.status }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="detail-footer">
        <pv-button 
          :label="t('staff.detailModal.edit')" 
          icon="pi pi-pencil"
          class="btn-edit" 
          @click="emit('edit', employee)" 
        />
        <pv-button 
          :label="t('staff.detailModal.delete')" 
          icon="pi pi-trash"
          class="btn-delete" 
          @click="emit('delete', employee)" 
        />
        <pv-button 
          :label="t('common.close')" 
          class="btn-close" 
          @click="emit('update:visible', false)" 
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.detail-container {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.avatar-0 { background-color: #00c1b0; }
.avatar-1 { background-color: #2563eb; }
.avatar-2 { background-color: #7c3aed; }
.avatar-3 { background-color: #db2777; }
.avatar-4 { background-color: #ea580c; }

.detail-title-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-name {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.detail-role-tag {
  align-self: flex-start;
  font-weight: 600;
  border-radius: 20px;
  padding: 4px 12px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 4px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.detail-label {
  color: #64748b;
  font-size: 0.9rem;
}

.detail-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
}

.font-mono {
  font-family: monospace;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #22c55e;
  font-weight: 700;
  font-size: 0.85rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
}

.btn-edit {
  flex: 1;
  background-color: #00c1b0 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 10px;
  font-weight: 600;
}

.btn-delete {
  flex: 1;
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
  border: none !important;
  border-radius: 10px;
  font-weight: 600;
}

.btn-close {
  flex: 1;
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border: none !important;
  border-radius: 10px;
  font-weight: 600;
}

.detail-footer {
  display: flex;
  gap: 12px;
  width: 100%;
}

.w-full {
  width: 100%;
}
</style>
