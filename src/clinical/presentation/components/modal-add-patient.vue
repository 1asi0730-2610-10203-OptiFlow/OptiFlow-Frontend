<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['save', 'close'])

const form = ref({
    fullName:  '',
    dni:       '',
    birthDate: '',
    email:     '',
    phone:     ''
})

const errors = ref({})
const submitted = ref(false)

function validate() {
    const e = {}
    if (!form.value.fullName.trim()) e.fullName = true
    if (!form.value.dni.trim())      e.dni = true
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
    <div class="overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Agregar Paciente</h3>
                    <p class="modal-subtitle">Registrar un nuevo paciente en el sistema</p>
                </div>
                <button class="close-btn" @click="emit('close')"><i class="pi pi-times" /></button>
            </div>

            <div class="modal-body">
                <!-- Full name -->
                <div class="field">
                    <label>Nombre Completo *</label>
                    <input
                        v-model="form.fullName"
                        class="form-input"
                        :class="{ 'form-input--error': errors.fullName }"
                        placeholder="ej. Sarah Johnson"
                        @input="errors.fullName = false"
                    />
                </div>

                <div class="form-row">
                    <!-- DNI -->
                    <div class="field">
                        <label>DNI / Doc. Identidad *</label>
                        <input
                            v-model="form.dni"
                            class="form-input"
                            :class="{ 'form-input--error': errors.dni }"
                            placeholder="ej. 12345678"
                            @input="errors.dni = false"
                        />
                    </div>
                    <!-- Birth date -->
                    <div class="field">
                        <label>Fecha de Nacimiento</label>
                        <input
                            v-model="form.birthDate"
                            type="date"
                            class="form-input"
                        />
                    </div>
                </div>

                <div class="form-row">
                    <!-- Email -->
                    <div class="field">
                        <label>Correo Electrónico</label>
                        <input
                            v-model="form.email"
                            type="email"
                            class="form-input"
                            placeholder="ej. paciente@correo.com"
                        />
                    </div>
                    <!-- Phone -->
                    <div class="field">
                        <label>Teléfono</label>
                        <input
                            v-model="form.phone"
                            class="form-input"
                            placeholder="ej. 903 897 123"
                        />
                    </div>
                </div>

                <p v-if="submitted && hasErrors" class="global-error">
                    Por favor rellene los campos obligatorios
                </p>
            </div>

            <div class="modal-footer">
                <button class="btn-cancel" @click="emit('close')">Cancelar</button>
                <button class="btn-save" @click="onSubmit">Registrar</button>
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
.global-error { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; color: #dc2626; margin: 0; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-save { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-save:hover { opacity: 0.9; }
</style>
