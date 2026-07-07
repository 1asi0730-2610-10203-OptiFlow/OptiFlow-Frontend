<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Supplier } from '../../domain/model/supplier.entity.js'
import { SupplierAssembler } from '../../infrastructure/supplier.assembler.js'
import { SupplierApi } from '../../infrastructure/supplier-api.js'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'
import { isValidEmail, isValidPhone } from '../../../shared/presentation/utils/validators.js'

const { t } = useI18n()
const emit = defineEmits(['register', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const supplierApi = new SupplierApi()

const form = ref({ name: '', contactPerson: '', phone: '', email: '' })
const errors = ref({})
const submitted = ref(false)

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function validate() {
  const e = {}
  if (!form.value.name.trim()) e.name = true
  if (!form.value.contactPerson.trim()) e.contactPerson = true
  if (!form.value.phone.trim()) e.phone = true
  else if (!isValidPhone(form.value.phone)) e.phoneFormat = true
  if (!form.value.email.trim()) e.email = true
  else if (!isValidEmail(form.value.email)) e.emailFormat = true
  errors.value = e
  return Object.keys(e).length === 0
}

function buildSupplier() {
  return new Supplier({
    id: 0,
    name:          form.value.name.trim(),
    contactPerson: form.value.contactPerson.trim(),
    phone:         form.value.phone.trim(),
    email:         form.value.email.trim()
  })
}

async function onRegister() {
  submitted.value = true
  if (!validate()) return
  const supplier = buildSupplier()
  const resource = SupplierAssembler.toResourceFromEntity(supplier)
  await supplierApi.createSupplier(resource)
  emit('register', supplier)
  requestClose()
}
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>

      <!-- Header -->
      <div class="modal-header">
        <div class="header-icon-wrap">
          <div class="header-icon">
            <i class="pi pi-truck" />
          </div>
        </div>
        <div class="header-text">
          <h3 class="modal-title">{{ $t('inventory.supplierModal.title') }}</h3>
          <p class="modal-subtitle">{{ $t('inventory.supplierModal.subtitle') }}</p>
        </div>
        <button class="close-btn" @click="requestClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">

        <!-- Name -->
        <div class="field field--full">
          <label class="field-label">
            <i class="pi pi-tag field-icon" />
            {{ $t('inventory.supplierModal.name') }}
            <span class="required-mark">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.name }"
            :placeholder="$t('inventory.supplierModal.namePlaceholder')"
            @input="errors.name = false"
          />
          <span v-if="errors.name" class="field-error">
            {{ $t('inventory.supplierModal.nameRequired') }}
          </span>
        </div>

        <!-- Contact Person -->
        <div class="field field--full">
          <label class="field-label">
            <i class="pi pi-user field-icon" />
            {{ $t('inventory.supplierModal.contactPerson') }}
            <span class="required-mark">*</span>
          </label>
          <input
            v-model="form.contactPerson"
            type="text"
            class="form-input"
            :class="{ 'form-input--error': errors.contactPerson }"
            :placeholder="$t('inventory.supplierModal.contactPersonPlaceholder')"
            @input="errors.contactPerson = false"
          />
          <span v-if="errors.contactPerson" class="field-error">
            {{ $t('inventory.supplierModal.contactPersonRequired') }}
          </span>
        </div>

        <!-- Phone & Email -->
        <div class="form-row">
          <div class="field">
            <label class="field-label">
              <i class="pi pi-phone field-icon" />
              {{ $t('inventory.supplierModal.phone') }}
              <span class="required-mark">*</span>
            </label>
            <input
              v-model="form.phone"
              type="tel"
              class="form-input"
              :class="{ 'form-input--error': errors.phone || errors.phoneFormat }"
              :placeholder="$t('inventory.supplierModal.phonePlaceholder')"
              @input="errors.phone = false; errors.phoneFormat = false"
            />
            <span v-if="errors.phone" class="field-error">
              {{ $t('inventory.supplierModal.phoneRequired') }}
            </span>
            <span v-else-if="errors.phoneFormat" class="field-error">
              {{ $t('inventory.supplierModal.phoneInvalid') }}
            </span>
          </div>

          <div class="field">
            <label class="field-label">
              <i class="pi pi-envelope field-icon" />
              {{ $t('inventory.supplierModal.email') }}
              <span class="required-mark">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'form-input--error': errors.email || errors.emailFormat }"
              :placeholder="$t('inventory.supplierModal.emailPlaceholder')"
              @input="errors.email = false; errors.emailFormat = false"
            />
            <span v-if="errors.email" class="field-error">
              {{ $t('inventory.supplierModal.emailRequired') }}
            </span>
            <span v-else-if="errors.emailFormat" class="field-error">
              {{ $t('inventory.supplierModal.emailInvalid') }}
            </span>
          </div>
        </div>

        <!-- Preview card -->
        <div v-if="form.name || form.contactPerson || form.phone || form.email" class="preview-card">
          <div class="preview-header">
            <i class="pi pi-eye preview-icon" />
            <span>{{ $t('inventory.supplierModal.preview') }}</span>
          </div>
          <div class="preview-body">
            <div class="preview-avatar">
              {{ form.name ? form.name.charAt(0).toUpperCase() : '?' }}
            </div>
            <div class="preview-info">
              <p class="preview-name">{{ form.name || '—' }}</p>
              <p v-if="form.contactPerson" class="preview-contact-person">
                <i class="pi pi-user" /> {{ form.contactPerson }}
              </p>
              <div class="preview-contact">
                <span v-if="form.phone" class="preview-chip">
                  <i class="pi pi-phone" /> {{ form.phone }}
                </span>
                <span v-if="form.email" class="preview-chip">
                  <i class="pi pi-envelope" /> {{ form.email }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p v-if="submitted && hasErrors" class="error-summary">
          {{ $t('common.requiredError') }}
        </p>

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="requestClose">
          <i class="pi pi-times" />
          {{ $t('common.cancel') }}
        </button>
        <button class="btn-register" @click="onRegister">
          <i class="pi pi-check" />
          {{ $t('inventory.supplierModal.register') }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.modal {
  background: #fff; border-radius: 18px; width: 100%; max-width: 520px;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  animation: modal-in 0.2s ease;
}
@keyframes modal-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.modal-header {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
}
.header-icon-wrap { flex-shrink: 0; }
.header-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: rgba(0,193,176,0.1); color: #00c1b0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
}
.header-text { flex: 1; }
.modal-title {
  font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem;
  font-weight: 700; color: #111827; margin: 0;
}
.modal-subtitle {
  font-family: 'Montserrat', sans-serif; font-size: 0.76rem;
  color: #6b7280; margin: 3px 0 0;
}
.close-btn {
  background: none; border: none; cursor: pointer; padding: 6px;
  border-radius: 8px; color: #9ca3af; transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.close-btn:hover { background: #f3f4f6; color: #374151; }

/* Body */
.modal-body {
  padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto; flex: 1;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field--full { grid-column: 1 / -1; }

.field-label {
  display: flex; align-items: center; gap: 5px;
  font-family: 'Montserrat', sans-serif; font-size: 0.82rem;
  font-weight: 600; color: #374151;
}
.field-icon { color: #00c1b0; font-size: 0.78rem; }
.required-mark { color: #ef4444; font-size: 0.9em; margin-left: 1px; }

.form-input {
  padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 9px;
  font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827;
  outline: none; background: #fff; transition: border-color 0.15s, box-shadow 0.15s;
}
.form-input::placeholder { color: #9ca3af; }
.form-input:focus {
  border-color: #00c1b0;
  box-shadow: 0 0 0 3px rgba(0,193,176,0.1);
}
.form-input--error {
  border-color: #f87171 !important;
  background-color: #fff5f5 !important;
  box-shadow: 0 0 0 3px rgba(248,113,113,0.1) !important;
}
.field-error {
  font-family: 'Montserrat', sans-serif; font-size: 0.74rem;
  color: #dc2626; margin-top: 1px;
}

/* Preview */
.preview-card {
  background: #f9fafb; border: 1px dashed #e5e7eb; border-radius: 12px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
}
.preview-header {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Montserrat', sans-serif; font-size: 0.74rem;
  font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;
}
.preview-icon { color: #00c1b0; }
.preview-body { display: flex; align-items: center; gap: 12px; }
.preview-avatar {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, #00c1b0, #0097e6);
  color: #fff; font-family: 'Josefin Sans', sans-serif;
  font-size: 1.1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.preview-info { flex: 1; min-width: 0; }
.preview-name {
  font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem;
  font-weight: 700; color: #111827; margin: 0 0 3px;
}
.preview-contact-person {
  font-family: 'Montserrat', sans-serif; font-size: 0.76rem;
  color: #6b7280; margin: 0 0 5px; display: flex; align-items: center; gap: 4px;
}
.preview-contact { display: flex; flex-wrap: wrap; gap: 6px; }
.preview-chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(0,193,176,0.08); color: #00c1b0;
  border: 1px solid rgba(0,193,176,0.2);
  font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 500;
  padding: 3px 9px; border-radius: 20px;
}

.error-summary {
  font-family: 'Montserrat', sans-serif; font-size: 0.8rem;
  color: #dc2626; margin: 0;
}

/* Footer */
.modal-footer {
  display: flex; gap: 8px; padding: 16px 24px;
  border-top: 1px solid #f3f4f6; flex-shrink: 0;
}
.btn-cancel {
  display: flex; align-items: center; gap: 6px;
  flex: 1; padding: 10px;
  border: 1px solid #e5e7eb; border-radius: 8px;
  background: #fff; font-family: 'Montserrat', sans-serif;
  font-size: 0.84rem; font-weight: 600; color: #6b7280;
  cursor: pointer; transition: background 0.15s; justify-content: center;
}
.btn-cancel:hover { background: #f9fafb; color: #374151; }

.btn-register {
  display: flex; align-items: center; gap: 6px;
  flex: 1; padding: 10px;
  border: none; border-radius: 8px;
  background: #00c1b0; color: #fff;
  font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600;
  cursor: pointer; transition: opacity 0.15s; justify-content: center;
}
.btn-register:hover { opacity: 0.9; }

@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
  .modal-footer { flex-wrap: wrap; }
  .btn-cancel { flex: 0 0 100%; }
  .btn-register { flex: 1; }
}
</style>
