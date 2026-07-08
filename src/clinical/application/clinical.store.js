import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PatientApi } from '../infrastructure/patient-api.js'
import { PrescriptionApi } from '../infrastructure/prescription-api.js'
import { ClinicalRecordApi } from '../infrastructure/clinical-record-api.js'
import { PatientAssembler } from '../infrastructure/patient.assembler.js'
import { PrescriptionAssembler } from '../infrastructure/prescription.assembler.js'
import { apiErrorMessage } from '../../shared/infrastructure/api-error.js'

const patientApi        = new PatientApi()
const prescriptionApi   = new PrescriptionApi()
const clinicalRecordApi = new ClinicalRecordApi()

export const useClinicalStore = defineStore('clinical', () => {
    const patientsRef        = ref([])
    const prescriptionsRef   = ref([])
    const clinicalRecordsRef = ref([])
    const loading = ref(false)
    const errors  = ref([])

    const patients        = computed(() => patientsRef.value)
    const prescriptions   = computed(() => prescriptionsRef.value)
    const clinicalRecords = computed(() => clinicalRecordsRef.value)

    // ── Patients ──────────────────────────────────────────────────────────
    async function loadPatients() {
        loading.value = true
        try {
            const resources = await patientApi.getPatients()
            // Solo reemplaza el array si la respuesta es válida
            if (Array.isArray(resources)) {
                patientsRef.value = PatientAssembler.toEntitiesFromResponse(resources)
            }
        } catch (e) {
            // No vaciar el array si el GET falla — conservar los datos anteriores
            console.error('[clinical.store] loadPatients error:', e.message)
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function createPatient(data) {
        loading.value = true
        try {
            const resource = PatientAssembler.toResourceFromEntity(data)
            const created  = await patientApi.createPatient(resource)
            const entity   = PatientAssembler.toEntityFromResource(created)
            patientsRef.value.unshift(entity)
            await loadClinicalRecords()
            return entity
        } catch (e) {
            // Surface the backend's real reason (e.g. which field failed validation) instead of the
            // opaque "Request failed with status code 400" so the caller can show it to the user.
            const message = apiErrorMessage(e)
            console.error('[clinical.store] createPatient error:', message)
            errors.value.push(message)
            throw new Error(message)
        } finally {
            loading.value = false
        }
    }

    // ── Clinical Records ──────────────────────────────────────────────────
    async function loadClinicalRecords() {
        loading.value = true
        try {
            const records = await clinicalRecordApi.getClinicalRecords()
            if (Array.isArray(records)) {
                clinicalRecordsRef.value = records
            }
        } catch (e) {
            console.error('[clinical.store] loadClinicalRecords error:', e.message)
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    function getRecordForPatient(patientId) {
        return clinicalRecordsRef.value.find(
            r => (r.patientId ?? r.patient_id) === patientId
        ) ?? null
    }

    // ── Prescriptions ─────────────────────────────────────────────────────
    async function loadPrescriptions() {
        loading.value = true
        try {
            const resources = await prescriptionApi.getPrescriptions()
            if (Array.isArray(resources)) {
                prescriptionsRef.value = PrescriptionAssembler.toEntitiesFromResponse(resources)
            }
        } catch (e) {
            console.error('[clinical.store] loadPrescriptions error:', e.message)
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    async function loadPrescriptionsByRecord(recordId) {
        loading.value = true
        try {
            const resources = await prescriptionApi.getPrescriptionsByRecordId(recordId)
            const incoming  = PrescriptionAssembler.toEntitiesFromResponse(resources)
            incoming.forEach(p => {
                if (!prescriptionsRef.value.find(e => e.id === p.id)) {
                    prescriptionsRef.value.push(p)
                }
            })
            return incoming
        } catch (e) {
            console.error('[clinical.store] loadPrescriptionsByRecord error:', e.message)
            errors.value.push(e.message)
            return []
        } finally {
            loading.value = false
        }
    }

    async function createPrescription(data) {
        loading.value = true
        try {
            const resource = PrescriptionAssembler.toResourceFromEntity(data)
            const created  = await prescriptionApi.createPrescription(resource)
            const entity   = PrescriptionAssembler.toEntityFromResource(created)
            prescriptionsRef.value.unshift(entity)
            return entity
        } catch (e) {
            console.error('[clinical.store] createPrescription error:', e.message)
            errors.value.push(e.message)
        } finally {
            loading.value = false
        }
    }

    function getPrescriptionsForRecord(recordId) {
        return prescriptionsRef.value.filter(p => p.clinicalRecordId === recordId)
    }

    return {
        patients, prescriptions, clinicalRecords, loading, errors,
        loadPatients, createPatient,
        loadClinicalRecords, getRecordForPatient,
        loadPrescriptions, loadPrescriptionsByRecord, createPrescription, getPrescriptionsForRecord
    }
})