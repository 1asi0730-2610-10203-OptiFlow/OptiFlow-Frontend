<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClinicalStore } from '../../application/clinical.store.js'
import ModalNewExam from './modal-new-exam.vue'
import ModalSuccess from './modal-success.vue'

const props = defineProps({
    patient: { type: Object, required: true }
})
const emit = defineEmits(['close'])

const store = useClinicalStore()
const activeTab = ref('hce') // 'hce' | 'profile' | 'orders'

const showNewExam  = ref(false)
const showSuccess  = ref(false)
const successMsg   = ref('')

// Load record + prescriptions for this patient
const record = computed(() => store.getRecordForPatient(props.patient.id))
const prescriptions = computed(() =>
    record.value ? store.getPrescriptionsForRecord(record.value.record_id ?? record.value.id) : []
)
const latestPrescription = computed(() => prescriptions.value[0] ?? null)

onMounted(async () => {
    if (record.value) {
        await store.loadPrescriptionsByRecord(record.value.record_id ?? record.value.id)
    }
})

function formatVal(val) {
    if (val === null || val === undefined) return '—'
    const n = parseFloat(val)
    if (isNaN(n)) return '—'
    return n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)
}

async function onSaveExam(data) {
    showNewExam.value = false
    if (data.fromFile) {
        successMsg.value = 'Expediente cargado satisfactoriamente'
    } else {
        await store.createPrescription(data)
        successMsg.value = 'Examen guardado satisfactoriamente'
    }
    showSuccess.value = true
}

function onSuccessNext() {
    showSuccess.value = false
}
</script>

<template>
    <!-- Success modal (top layer) -->
    <ModalSuccess
        v-if="showSuccess"
        :message="successMsg"
        @next="onSuccessNext"
    />

    <!-- New exam modal -->
    <ModalNewExam
        v-if="showNewExam"
        :patient="patient"
        :record-id="record ? (record.record_id ?? record.id) : 0"
        @save="onSaveExam"
        @close="showNewExam = false"
    />

    <!-- HCE Modal -->
    <div v-if="!showSuccess && !showNewExam" class="overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <!-- Header -->
            <div class="modal-header">
                <div class="patient-info">
                    <div class="avatar">{{ patient.initials }}</div>
                    <div>
                        <h3 class="patient-name">{{ patient.fullName }}</h3>
                        <p class="patient-meta">
                            DNI: {{ patient.dni }}
                            <span v-if="patient.age"> · {{ patient.age }} años</span>
                        </p>
                    </div>
                </div>
                <button class="close-btn" @click="emit('close')"><i class="pi pi-times" /></button>
            </div>

            <!-- Tabs -->
            <div class="tabs">
                <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'hce' }" @click="activeTab = 'hce'">
                    <i class="pi pi-heart" /> Historia Clínica (HCE)
                </button>
                <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'profile' }" @click="activeTab = 'profile'">
                    <i class="pi pi-user" /> Perfil
                </button>
                <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'orders' }" @click="activeTab = 'orders'">
                    <i class="pi pi-list" /> Órdenes
                </button>
            </div>

            <!-- ── HCE TAB ── -->
            <div v-if="activeTab === 'hce'" class="modal-body">
                <!-- Latest prescription -->
                <div v-if="latestPrescription">
                    <div class="section-header">
                        <span class="section-title">Última Receta Óptica</span>
                        <span class="section-meta">
                            {{ latestPrescription.formattedDate }}
                            <span v-if="latestPrescription.doctorName"> · {{ latestPrescription.doctorName }}</span>
                        </span>
                    </div>
                    <div class="prescription-table">
                        <div class="presc-header">
                            <span>OJO</span><span>ESFERA</span><span>CILINDRO</span><span>EJE</span>
                        </div>
                        <div class="presc-row">
                            <span>OD (Der)</span>
                            <span>{{ formatVal(latestPrescription.odSphere) }}</span>
                            <span>{{ formatVal(latestPrescription.odCylinder) }}</span>
                            <span>{{ latestPrescription.odAxis }}°</span>
                        </div>
                        <div class="presc-row">
                            <span>OS (Izq)</span>
                            <span>{{ formatVal(latestPrescription.oiSphere) }}</span>
                            <span>{{ formatVal(latestPrescription.oiCylinder) }}</span>
                            <span>{{ latestPrescription.oiAxis }}°</span>
                        </div>
                    </div>

                    <div v-if="latestPrescription.notes" class="notes-block">
                        <p class="notes-label">Notas Clínicas</p>
                        <p class="notes-text">{{ latestPrescription.notes }}</p>
                    </div>
                </div>

                <div v-else class="empty-hce">
                    <i class="pi pi-file-edit empty-icon" />
                    <p>Sin registros clínicos aún</p>
                </div>

                <!-- History of prescriptions -->
                <div v-if="prescriptions.length > 1">
                    <p class="section-title" style="margin-bottom: 8px">Historial de Recetas</p>
                    <div class="history-list">
                        <div v-for="presc in prescriptions.slice(1)" :key="presc.id" class="history-item">
                            <div class="history-top">
                                <span class="history-date">{{ presc.formattedDate }}</span>
                                <span class="history-doctor">{{ presc.doctorName }}</span>
                            </div>
                            <p class="history-summary">
                                OD: Esf {{ formatVal(presc.odSphere) }} Cil {{ formatVal(presc.odCylinder) }} Eje {{ presc.odAxis }}°
                                &nbsp;OS: Esf {{ formatVal(presc.oiSphere) }} Cil {{ formatVal(presc.oiCylinder) }} Eje {{ presc.oiAxis }}°
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Last visit -->
                <div v-if="latestPrescription" class="last-visit">
                    <p class="last-visit-label">ÚLTIMA VISITA</p>
                    <p class="last-visit-date">{{ latestPrescription.formattedDate }}</p>
                </div>
            </div>

            <!-- ── PROFILE TAB ── -->
            <div v-else-if="activeTab === 'profile'" class="modal-body">
                <div class="profile-grid">
                    <div class="profile-field">
                        <span class="pf-label">Nombre Completo</span>
                        <span class="pf-value">{{ patient.fullName }}</span>
                    </div>
                    <div class="profile-field">
                        <span class="pf-label">DNI</span>
                        <span class="pf-value">{{ patient.dni }}</span>
                    </div>
                    <div class="profile-field">
                        <span class="pf-label">Fecha de Nacimiento</span>
                        <span class="pf-value">{{ patient.birthDate || '—' }}</span>
                    </div>
                    <div class="profile-field">
                        <span class="pf-label">Edad</span>
                        <span class="pf-value">{{ patient.age ?? '—' }} años</span>
                    </div>
                    <div class="profile-field">
                        <span class="pf-label">Correo Electrónico</span>
                        <span class="pf-value">{{ patient.email || '—' }}</span>
                    </div>
                    <div class="profile-field">
                        <span class="pf-label">Teléfono</span>
                        <span class="pf-value">{{ patient.phone || '—' }}</span>
                    </div>
                </div>
            </div>

            <!-- ── ORDERS TAB ── -->
            <div v-else-if="activeTab === 'orders'" class="modal-body">
                <div class="empty-hce">
                    <i class="pi pi-list empty-icon" />
                    <p>No hay órdenes registradas para este paciente</p>
                </div>
            </div>

            <!-- Register new exam button -->
            <div class="modal-footer-exam">
                <button class="btn-register-exam" @click="showNewExam = true">
                    + Registrar Nuevo Examen
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 420px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.patient-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(0,193,176,0.15); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-family: 'Josefin Sans', sans-serif; font-size: 0.9rem; font-weight: 700; flex-shrink: 0; }
.patient-name { font-family: 'Josefin Sans', sans-serif; font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
.patient-meta { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #6b7280; margin: 2px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }

.tabs { display: flex; padding: 0 20px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.tab-btn { display: flex; align-items: center; gap: 5px; padding: 10px 12px; border: none; background: none; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; }
.tab-btn--active { color: #00c1b0; border-bottom-color: #00c1b0; font-weight: 600; }
.tab-btn:hover:not(.tab-btn--active) { color: #374151; }

.modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; flex: 1; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.section-title { font-family: 'Josefin Sans', sans-serif; font-size: 0.9rem; font-weight: 700; color: #111827; }
.section-meta { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #00c1b0; }

.prescription-table { border: 1px solid #f3f4f6; border-radius: 10px; overflow: hidden; }
.presc-header { display: grid; grid-template-columns: 80px 1fr 1fr 1fr; padding: 8px 12px; background: #f9fafb; }
.presc-header span { font-family: 'Montserrat', sans-serif; font-size: 0.68rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.presc-row { display: grid; grid-template-columns: 80px 1fr 1fr 1fr; padding: 10px 12px; border-top: 1px solid #f3f4f6; }
.presc-row span { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #374151; }
.presc-row span:first-child { font-weight: 600; }

.notes-block { margin-top: 2px; }
.notes-label { font-family: 'Josefin Sans', sans-serif; font-size: 0.84rem; font-weight: 700; color: #374151; margin: 0 0 4px; }
.notes-text { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #6b7280; margin: 0; line-height: 1.5; }

.empty-hce { padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: #9ca3af; }
.empty-icon { font-size: 1.5rem; }
.empty-hce p { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; margin: 0; }

.history-list { display: flex; flex-direction: column; gap: 6px; }
.history-item { padding: 10px 12px; border: 1px solid #f3f4f6; border-radius: 8px; }
.history-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
.history-date { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 600; color: #374151; }
.history-doctor { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #00c1b0; }
.history-summary { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #6b7280; margin: 0; }

.last-visit { padding-top: 4px; border-top: 1px solid #f3f4f6; }
.last-visit-label { font-family: 'Montserrat', sans-serif; font-size: 0.68rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 4px; }
.last-visit-date { font-family: 'Josefin Sans', sans-serif; font-size: 0.92rem; font-weight: 700; color: #111827; margin: 0; }

.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.profile-field { display: flex; flex-direction: column; gap: 4px; }
.pf-label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.pf-value { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; }

.modal-footer-exam { padding: 12px 20px; border-top: 2px dashed #00c1b0; flex-shrink: 0; }
.btn-register-exam { width: 100%; padding: 10px; border: none; background: transparent; color: #00c1b0; font-family: 'Montserrat', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; text-align: center; }
.btn-register-exam:hover { background: rgba(0,193,176,0.05); border-radius: 8px; }
</style>
