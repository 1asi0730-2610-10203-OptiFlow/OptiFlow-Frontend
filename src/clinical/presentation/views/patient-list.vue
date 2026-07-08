<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ContextMenu from 'primevue/contextmenu'
import { useClinicalStore } from '../../application/clinical.store.js'
import { eventBus } from '../../../shared/infrastructure/event-bus.js'
import ModalAddPatient from '../components/modal-add-patient.vue'
import ModalSuccess    from '../components/modal-success.vue'
import ModalHce        from '../components/modal-hce.vue'

const { t } = useI18n()
const store = useClinicalStore()

const searchQuery     = ref('')
const showAddPatient  = ref(false)
const showSuccess     = ref(false)
const successMsg      = ref('')
const selectedPatient = ref(null)

// ── Computed ────────────────────────────────────────────────────────────
const filteredPatients = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return store.patients
    return store.patients.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
    )
})

const latestPrescriptionFor = (patient) => {
    const record = store.getRecordForPatient(patient.id)
    if (!record) return null
    const recordId = record.record_id ?? record.id
    const prescriptions = store.getPrescriptionsForRecord(recordId)
    return prescriptions[0] ?? null
}

function formatVal(val) {
    if (val === null || val === undefined) return '—'
    const n = parseFloat(val)
    if (isNaN(n)) return '—'
    return n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)
}

// Stats cards
const stats = computed(() => [
    {
        icon: 'pi pi-users',
        value: store.patients.length,
        labelKey: 'patients.stats.total'
    },
    {
        icon: 'pi pi-calendar',
        value: store.patients.filter(p => !!p.birthDate).length,
        labelKey: 'patients.stats.activeThisMonth'
    },
    {
        icon: 'pi pi-clock',
        value: store.prescriptions.length,
        labelKey: 'patients.stats.withPendingOrders'
    },
    {
        icon: 'pi pi-bell',
        value: Math.floor(store.patients.length * 0.03),
        labelKey: 'patients.stats.pendingReview'
    }
])

// Pagination
const PAGE_SIZE    = 10
const currentPage  = ref(1)
const totalPages   = computed(() => Math.max(1, Math.ceil(filteredPatients.value.length / PAGE_SIZE)))
const pagedPatients = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredPatients.value.slice(start, start + PAGE_SIZE)
})

// ── Lifecycle ───────────────────────────────────────────────────────────
let unsubAddPatient
onMounted(async () => {
    await store.loadPatients()
    await store.loadClinicalRecords()
    await store.loadPrescriptions()
    unsubAddPatient = eventBus.on('ui:open:add-patient', () => { showAddPatient.value = true })
})
onUnmounted(() => { unsubAddPatient?.() })

// ── Actions ─────────────────────────────────────────────────────────────
const addPatientError = ref('')
async function onAddPatient(data) {
    addPatientError.value = ''
    try {
        await store.createPatient(data)
        showAddPatient.value = false
        successMsg.value = t('patients.toast.patientRegistered')
        showSuccess.value = true
    } catch (e) {
        // Keep the modal open and show the real backend reason instead of a false "success".
        addPatientError.value = e.message
    }
}

function onSuccessNext() {
    showSuccess.value = false
}

function openHce(patient) {
    selectedPatient.value = patient
}

// Right-click context menu
const contextMenuRef = ref(null)
const contextPatient = ref(null)

const contextMenuItems = computed(() => [
    {
        label: t('patients.table.viewHce'),
        icon: 'pi pi-file-edit',
        command: () => { openHce(contextPatient.value) }
    },
    { separator: true },
    {
        label: t('patients.contextMenu.copyDni'),
        icon: 'pi pi-id-card',
        command: () => { navigator.clipboard.writeText(contextPatient.value?.dni || '') }
    },
    {
        label: t('patients.contextMenu.copyEmail'),
        icon: 'pi pi-envelope',
        command: () => { navigator.clipboard.writeText(contextPatient.value?.email || '') }
    },
    {
        label: t('patients.contextMenu.copyPhone'),
        icon: 'pi pi-phone',
        command: () => { navigator.clipboard.writeText(contextPatient.value?.phone || '') }
    }
])

function onRowContextMenu(event, patient) {
    contextPatient.value = patient
    contextMenuRef.value.show(event)
}

// ── Export ──────────────────────────────────────────────────────────────
function escapeCsvValue(value) {
    const str = String(value ?? '')
    return /[",;\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function exportPatients() {
    if (!filteredPatients.value.length) return

    const headers = [
        'ID', 'Nombre completo', 'DNI', 'Email', 'Teléfono',
        'Última receta OD', 'Última receta OS', 'Última visita'
    ]

    const rows = filteredPatients.value.map(patient => {
        const rx = latestPrescriptionFor(patient)
        const odRx = rx ? `SPH ${formatVal(rx.odSphere)} CYL ${formatVal(rx.odCylinder)}` : '—'
        const osRx = rx ? `SPH ${formatVal(rx.oiSphere)} CYL ${formatVal(rx.oiCylinder)}` : '—'
        return [
            patient.id,
            patient.fullName,
            patient.dni,
            patient.email || '',
            patient.phone || '',
            odRx,
            osRx,
            rx?.formattedDate || ''
        ]
    })

    const csvContent = [headers, ...rows]
        .map(row => row.map(escapeCsvValue).join(','))
        .join('\r\n')

    // BOM al inicio para que Excel detecte UTF-8 y muestre tildes/ñ correctamente
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute('download', `pacientes_${today}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
</script>

<template>
    <!-- Success modal -->
    <ModalSuccess
        v-if="showSuccess"
        :message="successMsg"
        @next="onSuccessNext"
    />

    <!-- HCE Modal -->
    <ModalHce
        v-if="selectedPatient && !showSuccess"
        :patient="selectedPatient"
        @close="selectedPatient = null"
    />

    <!-- Add patient modal -->
    <ModalAddPatient
        v-if="showAddPatient && !showSuccess"
        :server-error="addPatientError"
        @save="onAddPatient"
        @close="showAddPatient = false"
    />

    <div class="page">
        <!-- Header -->
        <div class="page-header">
            <div>
                <h1 class="page-title">{{ $t('patients.pageTitle') }}</h1>
                <p class="page-subtitle">{{ $t('patients.pageSubtitle') }}</p>
            </div>
            <button class="btn-primary" @click="showAddPatient = true">
                <i class="pi pi-plus" /> {{ $t('patients.addPatient') }}
            </button>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
            <div v-for="(stat, i) in stats" :key="i" class="stat-card">
                <i :class="stat.icon" class="stat-icon" />
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ $t(stat.labelKey) }}</div>
            </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
            <div class="search-wrapper">
                <i class="pi pi-search search-icon" />
                <input
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    :placeholder="$t('patients.searchPlaceholder')"
                    @input="currentPage = 1"
                />
            </div>
            <button class="btn-export" :disabled="!filteredPatients.length" @click="exportPatients">
                <i class="pi pi-download" /> {{ $t('common.export') }}
            </button>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
            <div class="table-header-row">
                <span>{{ $t('patients.table.patient') }}</span>
                <span>{{ $t('patients.table.contact') }}</span>
                <span>{{ $t('patients.table.dni') }}</span>
                <span>{{ $t('patients.table.lastPrescription') }}</span>
                <span>{{ $t('patients.table.lastVisit') }}</span>
                <span>{{ $t('patients.table.nextAppointment') }}</span>
                <span>{{ $t('common.actions') }}</span>
            </div>

            <div v-if="store.loading" class="table-empty">
                <i class="pi pi-spin pi-spinner empty-icon" />
                <p>{{ $t('patients.loading') }}</p>
            </div>

            <div v-else-if="pagedPatients.length === 0" class="table-empty">
                <i class="pi pi-users empty-icon" />
                <p class="empty-title">{{ $t('patients.table.noResults') }}</p>
                <p class="empty-desc">{{ $t('patients.table.noResultsHint') }}</p>
            </div>

            <div
                v-for="patient in pagedPatients"
                :key="patient.id"
                class="table-row"
                @contextmenu.prevent="onRowContextMenu($event, patient)"
            >
                <!-- Patient -->
                <div class="row-patient">
                    <div class="avatar">{{ patient.initials }}</div>
                    <div>
                        <p class="patient-name">{{ patient.fullName }}</p>
                        <span class="patient-num">#{{ String(patient.id).padStart(4, '0') }}</span>
                    </div>
                </div>

                <!-- Contact -->
                <div class="row-contact">
                    <span class="contact-email"><i class="pi pi-envelope" /> {{ patient.email || '—' }}</span>
                    <span class="contact-phone"><i class="pi pi-phone" /> {{ patient.phone || '—' }}</span>
                </div>

                <!-- DNI -->
                <span class="row-dni">{{ patient.dni }}</span>

                <!-- Latest prescription -->
                <div class="row-rx">
                    <template v-if="latestPrescriptionFor(patient)">
                        <span class="rx-line">
                            <i class="pi pi-eye rx-icon" />
                            OD: {{ $t('patients.rx.sph') }} {{ formatVal(latestPrescriptionFor(patient)?.odSphere) }}
                            {{ $t('patients.rx.cyl') }} {{ formatVal(latestPrescriptionFor(patient)?.odCylinder) }}
                        </span>
                        <span class="rx-line">
                            OS: {{ $t('patients.rx.sph') }} {{ formatVal(latestPrescriptionFor(patient)?.oiSphere) }}
                            {{ $t('patients.rx.cyl') }} {{ formatVal(latestPrescriptionFor(patient)?.oiCylinder) }}
                        </span>
                    </template>
                    <span v-else class="rx-none">{{ $t('patients.rx.noPrescription') }}</span>
                </div>

                <!-- Last visit -->
                <span class="row-date">
                    {{ latestPrescriptionFor(patient)?.formattedDate || '—' }}
                </span>

                <!-- Next appointment (placeholder) -->
                <span class="row-appt">
                    <span class="appt-none">{{ $t('patients.table.notScheduled') }}</span>
                </span>

                <!-- Actions -->
                <div class="row-actions">
                    <button class="btn-hce" @click="openHce(patient)">
                        {{ $t('patients.table.viewHce') }} <i class="pi pi-chevron-right" />
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="table-footer">
                <span>
                    {{ $t('common.showing') }} {{ pagedPatients.length }}
                    {{ $t('common.of') }} {{ filteredPatients.length }}
                    {{ $t('patients.table.patients') }}
                </span>
                <div class="pagination">
                    <button
                        class="page-btn"
                        :disabled="currentPage <= 1"
                        @click="currentPage--"
                    >{{ $t('common.previous') }}</button>
                    <button
                        v-for="page in totalPages"
                        :key="page"
                        class="page-btn"
                        :class="{ 'page-btn--active': page === currentPage }"
                        @click="currentPage = page"
                    >{{ page }}</button>
                    <button
                        class="page-btn"
                        :disabled="currentPage >= totalPages"
                        @click="currentPage++"
                    >{{ $t('common.next') }}</button>
                </div>
            </div>
        </div>
    </div>

    <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; margin: 0; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; margin: 4px 0 0; }
.btn-primary { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border: none; border-radius: 8px; background: #03070a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:hover { opacity: 0.85; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-card { background: #fff; border-radius: 14px; padding: 18px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 6px; }
.stat-icon { font-size: 1.2rem; color: #6b7280; }
.stat-value { font-family: 'Josefin Sans', sans-serif; font-size: 1.7rem; font-weight: 700; color: #111827; }
.stat-label { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #6b7280; }

/* Toolbar */
.toolbar { background: #fff; border-radius: 12px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); padding: 12px 16px; display: flex; gap: 10px; align-items: center; }
.search-wrapper { flex: 1; position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.85rem; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; outline: none; color: #374151; box-sizing: border-box; }
.search-input:focus { border-color: #00c1b0; }
.btn-export { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 500; color: #374151; cursor: pointer; white-space: nowrap; }
.btn-export:hover { background: #f9fafb; }
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

/* Table */
.table-wrapper { background: #fff; border-radius: 14px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden; }
.table-header-row { display: grid; grid-template-columns: 1.4fr 1.4fr 0.8fr 1.3fr 0.9fr 0.9fr 0.8fr; gap: 12px; padding: 10px 20px; background: #f9fafb; border-bottom: 1px solid #f3f4f6; font-family: 'Montserrat', sans-serif; font-size: 0.7rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.table-row { display: grid; grid-template-columns: 1.4fr 1.4fr 0.8fr 1.3fr 0.9fr 0.9fr 0.8fr; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #f9fafb; align-items: center; transition: background 0.1s; cursor: default; }
.table-row:hover { background: #f9fafb; }
.table-row:last-child { border-bottom: none; }

.row-patient { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar { width: 34px; height: 34px; border-radius: 50%; background: rgba(0,193,176,0.15); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-family: 'Josefin Sans', sans-serif; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
.patient-name { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #111827; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.patient-num { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #9ca3af; }

.row-contact { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.contact-email, .contact-phone { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; display: flex; align-items: center; gap: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-email i, .contact-phone i { font-size: 0.7rem; flex-shrink: 0; }

.row-dni { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #374151; }

.row-rx { display: flex; flex-direction: column; gap: 2px; }
.rx-line { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #374151; display: flex; align-items: center; gap: 4px; }
.rx-icon { color: #00c1b0; font-size: 0.7rem; }
.rx-none { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #9ca3af; }

.row-date { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; }
.row-appt .appt-none { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; color: #9ca3af; font-style: italic; }

.row-actions { display: flex; gap: 6px; }
.btn-hce { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: none; background: transparent; color: #00c1b0; font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer; border-radius: 6px; white-space: nowrap; }
.btn-hce:hover { background: rgba(0,193,176,0.08); }

.table-empty { padding: 56px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: #9ca3af; }
.empty-icon { font-size: 1.4rem; }
.empty-title { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #374151; margin: 0; }
.empty-desc { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #9ca3af; margin: 0; }

.table-footer { padding: 12px 20px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.table-footer span { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.pagination { display: flex; gap: 6px; }
.page-btn { padding: 5px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; cursor: pointer; }
.page-btn:hover:not(:disabled) { background: #f9fafb; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn--active { background: #00c1b0; color: #fff; border-color: #00c1b0; }
</style>
