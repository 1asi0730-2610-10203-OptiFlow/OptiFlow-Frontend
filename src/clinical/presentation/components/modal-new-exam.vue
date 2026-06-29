<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'

const { t } = useI18n()

const props = defineProps({
    patient:  { type: Object, required: true },
    recordId: { type: Number, required: true }
})
const emit = defineEmits(['save', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const activeTab = ref('manual') // 'manual' | 'upload'

/* ── Doctors from API ───────────────────────────────────────── */
const doctors = ref([])
const selectedDoctor = ref('')

onMounted(async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_OPTIFLOW_API_URL}/employees?role_id=3`)
        doctors.value = res.data.map(e => e.name)
        selectedDoctor.value = doctors.value[0] ?? 'Dra. Emily Smith'
    } catch {
        doctors.value = ['Dra. Emily Smith']
        selectedDoctor.value = 'Dra. Emily Smith'
    }
})

/* ── Manual exam form ───────────────────────────────────────── */
const form = ref({
    examDate:   new Date().toISOString().split('T')[0],
    odSphere:   0,
    odCylinder: 0,
    odAxis:     0,
    oiSphere:   0,
    oiCylinder: 0,
    oiAxis:     0,
    addition:   null,
    notes:      ''
})

const errors = ref({})
const submitted = ref(false)

function validate() {
  const e = {}
  if (!form.value.examDate) e.examDate = true
  errors.value = e
  return Object.keys(e).length === 0
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function onSaveManual() {
    submitted.value = true
    if (!validate()) return

    emit('save', {
        clinicalRecordId: props.recordId,
        odSphere:         parseFloat(form.value.odSphere)   || 0,
        odCylinder:       parseFloat(form.value.odCylinder) || 0,
        odAxis:           parseInt(form.value.odAxis)       || 0,
        oiSphere:         parseFloat(form.value.oiSphere)   || 0,
        oiCylinder:       parseFloat(form.value.oiCylinder) || 0,
        oiAxis:           parseInt(form.value.oiAxis)       || 0,
        addition:         form.value.addition !== null ? parseFloat(form.value.addition) : null,
        notes:            form.value.notes,
        createdAt:        new Date().toISOString(),
        doctorName:       selectedDoctor.value
    })
}

/* ── Upload tab ─────────────────────────────────────────────── */
const uploadError = ref('')
const uploadedFile = ref(null)

const demoFiles = [
    { name: 'expediente_previo_2025.pdf', desc: 'Examen refractivo anual 2025' },
    { name: 'receta_optica_clinica.txt',  desc: 'Receta de óptica externa' }
]

function onFileSelected(event) {
    const file = event.target.files[0]
    if (!file) return
    if (file.size > 30 * 1024 * 1024) {
        uploadError.value = t('patients.newExam.fileTooLarge')
        return
    }
    uploadError.value = ''
    uploadedFile.value = file
    emit('save', { fromFile: true, fileName: file.name, clinicalRecordId: props.recordId, createdAt: new Date().toISOString(), doctorName: selectedDoctor.value })
}

function onDemoFile(demo) {
    uploadError.value = ''
    emit('save', { fromFile: true, fileName: demo.name, clinicalRecordId: props.recordId, createdAt: new Date().toISOString(), doctorName: selectedDoctor.value })
}

function triggerFileInput() {
    document.getElementById('file-input-exam').click()
}
</script>

<template>
    <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
        <div class="modal" @click.stop>
            <!-- Header -->
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">{{ $t('patients.newExam.title') }}</h3>
                    <p class="modal-subtitle">{{ $t('patients.newExam.patientLabel') }}: {{ patient.fullName }}</p>
                </div>
                <button class="close-btn" @click="requestClose"><i class="pi pi-times" /></button>
            </div>

            <!-- Tabs -->
            <div class="tabs">
                <button
                    class="tab-btn"
                    :class="{ 'tab-btn--active': activeTab === 'manual' }"
                    @click="activeTab = 'manual'"
                >
                    <i class="pi pi-file-edit" /> {{ $t('patients.newExam.tabs.manual') }}
                </button>
                <button
                    class="tab-btn"
                    :class="{ 'tab-btn--active': activeTab === 'upload' }"
                    @click="activeTab = 'upload'"
                >
                    <i class="pi pi-upload" /> {{ $t('patients.newExam.tabs.upload') }}
                </button>
            </div>

            <!-- ── MANUAL TAB ── -->
            <div v-if="activeTab === 'manual'" class="modal-body">
                <div class="form-row-2">
                    <div class="field">
                        <label>{{ $t('patients.newExam.examDate') }} *</label>
                        <input 
                            v-model="form.examDate" 
                            type="date" 
                            class="form-input" 
                            :class="{ 'form-input--error': errors.examDate }"
                            @input="errors.examDate = false"
                        />
                    </div>
                    <div class="field">
                        <label>{{ $t('patients.newExam.doctor') }}</label>
                        <select v-model="selectedDoctor" class="form-input">
                            <option v-for="doc in doctors" :key="doc" :value="doc">{{ doc }}</option>
                        </select>
                    </div>
                </div>

                <!-- Refraction table -->
                <div class="refraction-section">
                    <p class="section-label"><i class="pi pi-eye" style="color:#00c1b0" /> {{ $t('patients.newExam.refraction') }}</p>
                    <div class="refraction-table">
                        <div class="refraction-header">
                            <span>{{ $t('patients.hce.rx.eye') }}</span>
                            <span>{{ $t('patients.hce.rx.sphere') }}</span>
                            <span>{{ $t('patients.hce.rx.cylinder') }}</span>
                            <span>{{ $t('patients.hce.rx.axis') }}</span>
                        </div>
                        <!-- OD -->
                        <div class="refraction-row">
                            <span class="eye-label">{{ $t('patients.hce.rx.od') }}</span>
                            <input v-model="form.odSphere"   type="number" step="0.25" class="refr-input" />
                            <input v-model="form.odCylinder" type="number" step="0.25" class="refr-input" />
                            <input v-model="form.odAxis"     type="number" min="0" max="180" class="refr-input" />
                        </div>
                        <!-- OS -->
                        <div class="refraction-row">
                            <span class="eye-label">{{ $t('patients.hce.rx.os') }}</span>
                            <input v-model="form.oiSphere"   type="number" step="0.25" class="refr-input" />
                            <input v-model="form.oiCylinder" type="number" step="0.25" class="refr-input" />
                            <input v-model="form.oiAxis"     type="number" min="0" max="180" class="refr-input" />
                        </div>
                        <!-- Addition -->
                        <div class="refraction-row">
                            <span class="eye-label">{{ $t('patients.newExam.addition') }}</span>
                            <input v-model="form.addition" type="number" step="0.25" class="refr-input" placeholder="+2.00" />
                            <span class="refr-input refr-optional">{{ $t('patients.newExam.optional') }}</span>
                            <span></span>
                        </div>
                    </div>
                </div>

                <!-- Clinical notes -->
                <div class="field">
                    <label>{{ $t('patients.hce.clinicalNotes') }}</label>
                    <textarea
                        v-model="form.notes"
                        class="form-textarea"
                        :placeholder="$t('patients.newExam.notesPlaceholder')"
                        rows="3"
                    />
                </div>

                <p v-if="submitted && hasErrors" style="color: #dc2626; font-size: 0.8rem; font-family: Montserrat; margin: 0;">
                    {{ $t('common.requiredError') }}
                </p>
            </div>

            <!-- ── UPLOAD TAB ── -->
            <div v-else class="modal-body">
                <div class="drop-zone" @click="triggerFileInput">
                    <input
                        id="file-input-exam"
                        type="file"
                        accept=".pdf,.txt,.csv"
                        style="display:none"
                        @change="onFileSelected"
                    />
                    <i class="pi pi-upload drop-icon" />
                    <p class="drop-text">{{ $t('patients.newExam.dropZoneText') }}</p>
                    <p class="drop-hint">{{ $t('patients.newExam.dropZoneHint') }}</p>
                    <button class="btn-select-file" @click.stop="triggerFileInput">{{ $t('patients.newExam.selectFile') }}</button>
                </div>

                <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>

                <!-- Demo files -->
                <div>
                    <p class="demo-label">{{ $t('patients.newExam.demoFilesLabel') }}</p>
                    <div class="demo-list">
                        <div
                            v-for="demo in demoFiles"
                            :key="demo.name"
                            class="demo-item"
                            @click="onDemoFile(demo)"
                        >
                            <i class="pi pi-file demo-file-icon" />
                            <div class="demo-info">
                                <span class="demo-name">{{ demo.name }}</span>
                                <span class="demo-desc">{{ demo.desc }}</span>
                            </div>
                            <i class="pi pi-chevron-right demo-chevron" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <button class="btn-cancel" @click="emit('close')">{{ $t('common.cancel') }}</button>
                <button v-if="activeTab === 'manual'" class="btn-save" @click="onSaveManual">{{ $t('patients.newExam.saveExam') }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 60; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 540px; max-height: 92vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px 16px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }

.tabs { display: flex; gap: 0; padding: 0 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 12px 16px; border: none; background: none; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; }
.tab-btn--active { color: #00c1b0; border-bottom-color: #00c1b0; font-weight: 600; }
.tab-btn:hover:not(.tab-btn--active) { color: #374151; }

.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; flex-shrink: 0; }

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.form-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #00c1b0; }
.form-input--error { border-color: #f87171 !important; background-color: #fff5f5 !important; }
.form-input:disabled { background: #f9fafb; color: #6b7280; }
.form-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; outline: none; resize: vertical; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
.form-textarea:focus { border-color: #00c1b0; }

.refraction-section { display: flex; flex-direction: column; gap: 10px; }
.section-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; margin: 0; display: flex; align-items: center; gap: 6px; }
.refraction-table { border: 1px solid #e0faf8; border-radius: 10px; overflow: hidden; background: #f0fdfb; }
.refraction-header { display: grid; grid-template-columns: 110px 1fr 1fr 1fr; padding: 8px 12px; background: #e0faf8; }
.refraction-header span { font-family: 'Montserrat', sans-serif; font-size: 0.7rem; font-weight: 700; color: #00c1b0; text-transform: uppercase; letter-spacing: 0.06em; }
.refraction-row { display: grid; grid-template-columns: 110px 1fr 1fr 1fr; gap: 6px; padding: 8px 12px; border-top: 1px solid #e0faf8; align-items: center; }
.eye-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.refr-input { padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #111827; outline: none; background: #fff; text-align: center; width: 100%; box-sizing: border-box; }
.refr-input:focus { border-color: #00c1b0; }
.refr-optional { color: #9ca3af; font-size: 0.76rem; background: transparent; border: none; text-align: left; }

.drop-zone { border: 2px dashed #00c1b0; border-radius: 12px; padding: 32px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: background 0.15s; }
.drop-zone:hover { background: rgba(0,193,176,0.04); }
.drop-icon { font-size: 1.8rem; color: #00c1b0; }
.drop-text { font-family: 'Montserrat', sans-serif; font-size: 0.88rem; font-weight: 600; color: #374151; margin: 0; }
.drop-hint { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #9ca3af; margin: 0; }
.btn-select-file { margin-top: 8px; padding: 8px 20px; border: none; border-radius: 20px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-select-file:hover { opacity: 0.9; }
.upload-error { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; color: #dc2626; margin: 0; }
.demo-label { font-family: 'Montserrat', sans-serif; font-size: 0.68rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px; }
.demo-list { display: flex; flex-direction: column; gap: 6px; }
.demo-item { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #f3f4f6; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
.demo-item:hover { background: #f9fafb; }
.demo-file-icon { font-size: 1rem; color: #6b7280; flex-shrink: 0; }
.demo-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.demo-name { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.demo-desc { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #9ca3af; }
.demo-chevron { color: #d1d5db; font-size: 0.75rem; }

.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-save { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-save:hover { opacity: 0.9; }
</style>
