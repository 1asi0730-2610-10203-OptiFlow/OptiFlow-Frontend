<script setup>
import { ref } from 'vue'

const showSuccess = ref(true)

const profile = ref({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@ejemplo.com',
  phone: '+51 987 654 321',
  address: 'Av. Javier Prado Este 4200',
  city: 'Lima',
  birthDate: ''
})

const medicalInfo = ref({
  recordNumber: 'HC-2850',
  lastVisit: '15 Mar 2026',
  optometrist: 'Dr. Smith',
  nextAppointment: '15 Sep 2026'
})

function saveChanges() {
  showSuccess.value = true
  setTimeout(() => showSuccess.value = false, 3000)
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ $t('patientCenter.profile.title') }}</h1>
        <p class="page-subtitle">{{ $t('patientCenter.profile.subtitle') }}</p>
      </div>
      
      <!-- User info in header (Desktop only layout match reference) -->
      <div class="header-user">
        <div class="user-text">
          <strong>{{ profile.firstName }} {{ profile.lastName }}</strong>
          <span>{{ $t('patientCenter.profile.patientRole') }}</span>
        </div>
        <div class="avatar-lg">JD</div>
      </div>
    </div>

    <div class="profile-content">
      <!-- Success Banner -->
      <transition name="fade">
        <div v-if="showSuccess" class="success-banner">
          <i class="pi pi-check-circle success-icon" />
          <div>
            <strong>{{ $t('patientCenter.profile.successTitle') }}</strong>
            <p>{{ $t('patientCenter.profile.successMsg') }}</p>
          </div>
        </div>
      </transition>

      <!-- Main Profile Card -->
      <div class="card">
        <div class="card-body form-grid">
          <div class="avatar-header">
            <div class="avatar-xl">JD</div>
            <div class="avatar-info">
              <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
              <p>{{ $t('patientCenter.profile.patientRole') }}</p>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>{{ $t('patientCenter.profile.firstName') }} <span class="required">*</span></label>
              <div class="input-icon-wrapper">
                <i class="pi pi-user input-icon"></i>
                <input v-model="profile.firstName" type="text" class="form-input with-icon" />
              </div>
            </div>
            <div class="field">
              <label>{{ $t('patientCenter.profile.lastName') }} <span class="required">*</span></label>
              <div class="input-icon-wrapper">
                <i class="pi pi-user input-icon"></i>
                <input v-model="profile.lastName" type="text" class="form-input with-icon" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>{{ $t('patientCenter.profile.email') }} <span class="required">*</span></label>
              <div class="input-icon-wrapper">
                <i class="pi pi-envelope input-icon"></i>
                <input v-model="profile.email" type="email" class="form-input with-icon" />
              </div>
            </div>
            <div class="field">
              <label>{{ $t('patientCenter.profile.phone') }} <span class="required">*</span></label>
              <div class="input-icon-wrapper">
                <i class="pi pi-phone input-icon"></i>
                <input v-model="profile.phone" type="text" class="form-input with-icon" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>{{ $t('patientCenter.profile.address') }} <span class="required">*</span></label>
              <div class="input-icon-wrapper">
                <i class="pi pi-map-marker input-icon"></i>
                <input v-model="profile.address" type="text" class="form-input with-icon" />
              </div>
            </div>
            <div class="field">
              <label>{{ $t('patientCenter.profile.city') }}</label>
              <div class="input-icon-wrapper">
                <i class="pi pi-map input-icon"></i>
                <input v-model="profile.city" type="text" class="form-input with-icon" />
              </div>
            </div>
          </div>

          <div class="field">
            <label>{{ $t('patientCenter.profile.birthDate') }}</label>
            <div class="input-icon-wrapper">
              <i class="pi pi-calendar input-icon"></i>
              <input v-model="profile.birthDate" type="date" class="form-input with-icon" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="showSuccess = false">{{ $t('common.cancel') }}</button>
            <button class="btn-save" @click="saveChanges">
              <i class="pi pi-save"></i> {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Medical Info Card -->
      <div class="card medical-card">
        <div class="card-header borderless">
          <h3 class="card-title">{{ $t('patientCenter.profile.medicalInfo') }}</h3>
        </div>
        <div class="card-body">
          <div class="medical-grid">
            <div class="med-item">
              <span class="med-label">{{ $t('patientCenter.profile.recordNumber') }}</span>
              <strong class="med-val">{{ medicalInfo.recordNumber }}</strong>
            </div>
            <div class="med-item">
              <span class="med-label">{{ $t('patientCenter.profile.lastVisit') }}</span>
              <strong class="med-val">{{ medicalInfo.lastVisit }}</strong>
            </div>
            <div class="med-item">
              <span class="med-label">{{ $t('patientCenter.profile.optometrist') }}</span>
              <strong class="med-val">{{ medicalInfo.optometrist }}</strong>
            </div>
            <div class="med-item">
              <span class="med-label">{{ $t('patientCenter.profile.nextAppt') }}</span>
              <strong class="med-val">{{ medicalInfo.nextAppointment }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="info-banner">
        <i class="pi pi-info-circle info-icon" />
        <div>
          <p class="info-title">{{ $t('patientCenter.profile.privacyTitle') }}</p>
          <p class="info-text">{{ $t('patientCenter.profile.privacyText') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 800px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;}
.header-user { display: flex; align-items: center; gap: 12px; }
.user-text { display: flex; flex-direction: column; text-align: right; }
.user-text strong { font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: #111827; }
.user-text span { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #9ca3af; }
.avatar-lg { width: 40px; height: 40px; border-radius: 50%; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 1.1rem; }

.profile-content { display: flex; flex-direction: column; gap: 20px; }

/* Banner */
.success-banner {
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;
  padding: 16px 20px; display: flex; align-items: flex-start; gap: 12px; color: #166534;
}
.success-icon { color: #22c55e; font-size: 1.2rem; margin-top: 2px; }
.success-banner strong { font-family: 'Montserrat', sans-serif; font-size: 0.9rem; display: block; margin-bottom: 4px; }
.success-banner p { font-size: 0.8rem; margin: 0; opacity: 0.9; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Main Card */
.form-grid { padding: 30px; display: flex; flex-direction: column; gap: 20px; }
.avatar-header { display: flex; align-items: center; gap: 16px; margin-bottom: 10px; }
.avatar-xl { width: 64px; height: 64px; border-radius: 50%; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 1.8rem; }
.avatar-info h2 { font-family: 'Josefin Sans', sans-serif; font-size: 1.4rem; color: #111827; margin: 0 0 4px; }
.avatar-info p { font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: #9ca3af; margin: 0; }

.form-row { display: flex; gap: 20px; }
.form-row .field { flex: 1; }

.field label { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; font-weight: 600; color: #4b5563; margin-bottom: 8px; display: block; }
.required { color: #ef4444; }

.input-icon-wrapper { position: relative; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.form-input.with-icon { padding-left: 40px; width: 100%; border: 1px solid #d1d5db; border-radius: 8px; height: 42px; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: #1f2937; outline: none; transition: border-color 0.2s; }
.form-input.with-icon:focus { border-color: #00c1b0; }

.form-actions { display: flex; gap: 16px; margin-top: 10px; padding-top: 24px; border-top: 1px solid #f3f4f6; }
.btn-cancel, .btn-save { flex: 1; height: 44px; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px; }
.btn-cancel { background: transparent; border: 1px solid #d1d5db; color: #4b5563; }
.btn-cancel:hover { background: #f9fafb; border-color: #9ca3af; }
.btn-save { background: #00c1b0; border: none; color: white; }
.btn-save:hover { background: #00a89a; }

/* Medical Card */
.borderless { border-bottom: none; padding-bottom: 0; }
.medical-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.med-item { background: #f9fafb; padding: 16px; border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
.med-label { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #6b7280; }
.med-val { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; color: #111827; }

/* Privacy Banner */
.info-banner {
  background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px;
  padding: 16px 20px; display: flex; align-items: flex-start; gap: 14px;
}
.info-icon { color: #3b82f6; font-size: 1.1rem; margin-top: 2px; }
.info-title { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 700; color: #1e40af; margin: 0 0 4px; }
.info-text { font-size: 0.8rem; color: #3b82f6; margin: 0; line-height: 1.5; opacity: 0.9; }

@media (max-width: 640px) {
  .form-row { flex-direction: column; gap: 16px; }
  .form-actions { flex-direction: column; }
  .medical-grid { grid-template-columns: 1fr; }
  .header-user { display: none; } /* Hide on mobile to save space */
}
</style>
