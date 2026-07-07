<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'
import { isValidEmail, isValidPhone, isValidDni } from '../../../shared/presentation/utils/validators.js'

const { t } = useI18n()
const emit = defineEmits(['save', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const form = ref({
    fullName:  '',
    dni:       '',
    birthDate: '',
    email:     '',
    phone:     ''
})

const errors = ref({})
const submitted = ref(false)

const today = new Date()
const maxBirthDate = computed(() => today.toISOString().split('T')[0])
const minBirthDate = computed(() => {
    const d = new Date(today)
    d.setFullYear(d.getFullYear() - 100)
    return d.toISOString().split('T')[0]
})

function validate() {
    const e = {}
    const trimmedName = form.value.fullName.trim()
    if (!trimmedName) e.fullName = true
    else if (trimmedName.split(/\s+/).length < 2) e.lastNameMissing = true
    if (!form.value.dni.trim())      e.dni = true
    else if (!isValidDni(form.value.dni)) e.dniFormat = true
    if (!form.value.birthDate) e.birthDate = true
    else if (form.value.birthDate < minBirthDate.value || form.value.birthDate > maxBirthDate.value) e.birthDate = true
    if (!form.value.email.trim()) e.email = true
    else if (!isValidEmail(form.value.email)) e.emailFormat = true
    if (!form.value.phone.trim()) e.phone = true
    else if (!isValidPhone(form.value.phone)) e.phoneFormat = true
    errors.value = e
    return Object.keys(e).length === 0
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function onSubmit() {
    submitted.value = true
    if (!validate()) return

    const parts = form.value.fullName.trim().split(' ')
    const firstName = parts[0] ?? ''
    const lastName  = parts.slice(1).join(' ') || ''

    emit('save', {
        id:           0,
        customerUuid: '',
        firstName,
        lastName,
        dni:       form.value.dni.trim(),
        phone:     form.value.phone.trim(),
        email:     form.value.email.trim(),
        birthDate: form.value.birthDate
    })
}
</script>

<template>
    <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
        <div class="modal" @click.stop>
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">{{ $t('patients.addModal.title') }}</h3>
                    <p class="modal-subtitle">{{ $t('patients.addModal.subtitle') }}</p>
                </div>
                <button class="close-btn" @click="requestClose"><i class="pi pi-times" /></button>
            </div>

            <div class="modal-body">
                <!-- Full name -->
                <div class="field">
                    <label>{{ $t('patients.addModal.fullName') }} *</label>
                    <input
                        v-model="form.fullName"
                        class="form-input"
                        :class="{ 'form-input--error': errors.fullName || errors.lastNameMissing }"
                        :placeholder="$t('patients.addModal.fullNamePlaceholder')"
                        @input="errors.fullName = false; errors.lastNameMissing = false"
                    />
                    <span v-if="errors.fullName" class="field-error">
                        {{ $t('patients.addModal.fullNameRequired') }}
                    </span>
                    <span v-else-if="errors.lastNameMissing" class="field-error">
                        {{ $t('patients.addModal.lastNameRequired') }}
                    </span>
                </div>

                <div class="form-row">
                    <!-- DNI -->
                    <div class="field">
                        <label>{{ $t('patients.addModal.dni') }} *</label>
                        <input
                            v-model="form.dni"
                            class="form-input"
                            :class="{ 'form-input--error': errors.dni || errors.dniFormat }"
                            :placeholder="$t('patients.addModal.dniPlaceholder')"
                            @input="errors.dni = false; errors.dniFormat = false"
                        />
                        <span v-if="errors.dni" class="field-error">
                            {{ $t('common.fieldRequired') }}
                        </span>
                        <span v-else-if="errors.dniFormat" class="field-error">
                            {{ $t('patients.addModal.dniInvalid') }}
                        </span>
                    </div>
                    <!-- Birth date -->
                    <div class="field">
                        <label>{{ $t('patients.addModal.birthDate') }} *</label>
                        <input
                            v-model="form.birthDate"
                            type="date"
                            class="form-input"
                            :class="{ 'form-input--error': errors.birthDate }"
                            :min="minBirthDate"
                            :max="maxBirthDate"
                            @change="errors.birthDate = false"
                        />
                        <span v-if="errors.birthDate" class="field-error">
                            {{ $t('patients.addModal.birthDateError') }}
                        </span>
                    </div>
                </div>

                <div class="form-row">
                    <!-- Email -->
                    <div class="field">
                        <label>{{ $t('patients.addModal.email') }} *</label>
                        <input
                            v-model="form.email"
                            type="email"
                            class="form-input"
                            :class="{ 'form-input--error': errors.email || errors.emailFormat }"
                            :placeholder="$t('patients.addModal.emailPlaceholder')"
                            @input="errors.email = false; errors.emailFormat = false"
                        />
                        <span v-if="errors.email" class="field-error">
                            {{ $t('common.fieldRequired') }}
                        </span>
                        <span v-else-if="errors.emailFormat" class="field-error">
                            {{ $t('patients.addModal.emailInvalid') }}
                        </span>
                    </div>
                    <!-- Phone -->
                    <div class="field">
                        <label>{{ $t('patients.addModal.phone') }} *</label>
                        <input
                            v-model="form.phone"
                            class="form-input"
                            :class="{ 'form-input--error': errors.phone || errors.phoneFormat }"
                            :placeholder="$t('patients.addModal.phonePlaceholder')"
                            @input="errors.phone = false; errors.phoneFormat = false"
                        />
                        <span v-if="errors.phone" class="field-error">
                            {{ $t('common.fieldRequired') }}
                        </span>
                        <span v-else-if="errors.phoneFormat" class="field-error">
                            {{ $t('patients.addModal.phoneInvalid') }}
                        </span>
                    </div>
                </div>

                <p v-if="submitted && hasErrors" class="global-error">
                    {{ $t('patients.addModal.requiredError') }}
                </p>
            </div>

            <div class="modal-footer">
                <button class="btn-cancel" @click="requestClose">{{ $t('common.cancel') }}</button>
                <button class="btn-save" @click="onSubmit">{{ $t('patients.addModal.register') }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 500px; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.form-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #00c1b0; }
.form-input--error { border-color: #f87171; }
.field-error { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; color: #dc2626; margin-top: 2px; }
.global-error { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; color: #dc2626; margin: 0; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-save { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-save:hover { opacity: 0.9; }
</style>
