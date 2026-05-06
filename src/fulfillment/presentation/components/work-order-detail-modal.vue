<script setup>
const props = defineProps({
  workOrder: { type: Object, required: true }
})
const emit = defineEmits(['close', 'statusChanged'])

const COLUMNAS = [
  { key: 'PENDING',         label: 'Recibida' },
  { key: 'IN_PRODUCTION',   label: 'Biselado' },
  { key: 'QUALITY_CONTROL', label: 'Control QC' },
  { key: 'READY',           label: 'Listo' }
]

const SIGUIENTE = {
  PENDING:         'IN_PRODUCTION',
  IN_PRODUCTION:   'QUALITY_CONTROL',
  QUALITY_CONTROL: 'READY',
  READY:           'DELIVERED',
  DELIVERED:       null
}

const ANTERIOR = {
  PENDING:         null,
  IN_PRODUCTION:   'PENDING',
  QUALITY_CONTROL: 'IN_PRODUCTION',
  READY:           'QUALITY_CONTROL',
  DELIVERED:       'READY'
}

const SIGUIENTE_LABEL = {
  IN_PRODUCTION:   'Biselado',
  QUALITY_CONTROL: 'Control de Calidad',
  READY:           'Listo para Entrega',
  DELIVERED:       'Entregado'
}

const ANTERIOR_LABEL = {
  PENDING:         'Recibida',
  IN_PRODUCTION:   'Biselado',
  QUALITY_CONTROL: 'Control QC',
  READY:           'Listo'
}

const ORDER_FLOW = ['PENDING', 'IN_PRODUCTION', 'QUALITY_CONTROL', 'READY', 'DELIVERED']

function idxActual() {
  return ORDER_FLOW.indexOf(props.workOrder.status)
}

function onAdvance() {
  const next = SIGUIENTE[props.workOrder.status]
  if (next) { emit('statusChanged', next); emit('close') }
}

function onGoBack() {
  const prev = ANTERIOR[props.workOrder.status]
  if (prev) { emit('statusChanged', prev); emit('close') }
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>

      <div class="modal-header">
        <div>
          <p class="order-id-small">{{ workOrder.id }}</p>
          <h3 class="order-patient">{{ workOrder.patientName || workOrder.paciente }}</h3>
        </div>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Progreso -->
        <div class="progress-section">
          <p class="section-label">Progreso de la Orden</p>
          <div class="progress-bar">
            <template v-for="(col, i) in COLUMNAS" :key="col.key">
              <div class="progress-step" :class="{ 'progress-step--done': i <= idxActual() }" />
              <i v-if="i < COLUMNAS.length - 1" class="pi pi-chevron-right progress-arrow" />
            </template>
          </div>
          <div class="progress-labels">
            <span
                v-for="col in COLUMNAS"
                :key="col.key"
                class="progress-label"
                :class="{ 'progress-label--active': workOrder.status === col.key }"
            >{{ col.label }}</span>
          </div>
        </div>

        <!-- Info grid -->
        <div class="info-grid">
          <div class="info-card">
            <p class="info-card-label">Tipo de Producto</p>
            <p class="info-card-value">{{ workOrder.tipo || '—' }}</p>
          </div>
          <div class="info-card">
            <p class="info-card-label">Armazón</p>
            <p class="info-card-value">{{ workOrder.armazon || '—' }}</p>
          </div>
          <div class="info-card">
            <p class="info-card-label">Laboratorio</p>
            <p class="info-card-value">{{ workOrder.laboratorio || workOrder.laboratoryName || '—' }}</p>
          </div>
          <div class="info-card">
            <p class="info-card-label">Fecha Esperada</p>
            <p class="info-card-value">{{ workOrder.deliveryDate || workOrder.fechaEsperada }}</p>
          </div>
        </div>

        <!-- Receta -->
        <div class="recipe-box">
          <div class="recipe-header">
            <i class="pi pi-eye" style="color: #00c1b0" />
            <span class="recipe-title">Receta Óptica</span>
          </div>
          <p class="recipe-text">{{ workOrder.receta || `Receta ID: ${workOrder.recipeId}` }}</p>
        </div>

        <!-- Pagos -->
        <div class="payment-box">
          <p class="section-label">Resumen de Pago</p>
          <div class="payment-row">
            <span class="payment-label">Total</span>
            <span class="payment-value">S/ {{ (workOrder.total || 0).toFixed(2) }}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">Adelanto pagado</span>
            <span class="payment-value payment-value--green">- S/ {{ (workOrder.adelanto || 0).toFixed(2) }}</span>
          </div>
          <div class="payment-row payment-row--total">
            <span class="payment-label">Saldo pendiente</span>
            <span
                class="payment-value"
                :class="(workOrder.total - workOrder.adelanto) > 0 ? 'payment-value--orange' : 'payment-value--green'"
            >
              S/ {{ Math.max(0, (workOrder.total || 0) - (workOrder.adelanto || 0)).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <span class="priority-chip" :class="`priority-chip--${workOrder.prioridad || 'normal'}`">
          {{ workOrder.prioridad === 'urgente' ? 'URGENTE' : workOrder.prioridad === 'alta' ? 'ALTA' : 'Normal' }} prioridad
        </span>
        <div class="footer-actions">
          <button v-if="ANTERIOR[workOrder.status]" class="back-btn" @click="onGoBack">
            <i class="pi pi-chevron-left" /> {{ ANTERIOR_LABEL[ANTERIOR[workOrder.status]] }}
          </button>
          <button v-if="SIGUIENTE[workOrder.status]" class="advance-btn-modal" @click="onAdvance">
            Mover a "{{ SIGUIENTE_LABEL[SIGUIENTE[workOrder.status]] }}"
            <i class="pi pi-chevron-right" />
          </button>
          <span v-else class="completed-label">✓ Orden completada</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.order-id-small { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #9ca3af; margin: 0; }
.order-patient { font-family: 'Josefin Sans', sans-serif; font-size: 1.15rem; font-weight: 700; color: #111827; margin: 2px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; }
.section-label { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 600; color: #6b7280; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
.progress-bar { display: flex; align-items: center; gap: 4px; }
.progress-step { height: 8px; border-radius: 4px; flex: 1; background: #e5e7eb; transition: background 0.2s; }
.progress-step--done { background: #00c1b0; }
.progress-arrow { font-size: 0.6rem; color: #d1d5db; flex-shrink: 0; }
.progress-labels { display: flex; justify-content: space-between; margin-top: 6px; }
.progress-label { font-family: 'Montserrat', sans-serif; font-size: 0.7rem; color: #9ca3af; }
.progress-label--active { color: #00c1b0; font-weight: 700; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.info-card { background: #f9fafb; border-radius: 10px; padding: 12px; }
.info-card-label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #6b7280; margin: 0 0 4px; }
.info-card-value { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; color: #111827; margin: 0; }
.recipe-box { background: rgba(150,246,238,0.2); border-radius: 10px; padding: 14px; }
.recipe-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.recipe-title { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 700; color: #00c1b0; }
.recipe-text { font-family: 'Courier New', monospace; font-size: 0.78rem; color: #1f2937; margin: 0; }
.payment-box { background: #f9fafb; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.payment-row { display: flex; justify-content: space-between; align-items: center; }
.payment-row--total { border-top: 1px solid #e5e7eb; padding-top: 8px; }
.payment-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.payment-value { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; color: #111827; }
.payment-value--green { color: #16a34a; }
.payment-value--orange { color: #ea580c; }
.modal-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid #f3f4f6; flex-shrink: 0; gap: 10px; }
.priority-chip { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; flex-shrink: 0; }
.priority-chip--urgente { background: #fee2e2; color: #b91c1c; }
.priority-chip--alta    { background: #ffedd5; color: #c2410c; }
.priority-chip--normal  { background: #f3f4f6; color: #6b7280; }
.footer-actions { display: flex; align-items: center; gap: 8px; }
.back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.back-btn:hover { background: #e5e7eb; }
.advance-btn-modal { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #00c1b0; color: #fff; border: none; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.advance-btn-modal:hover { opacity: 0.9; }
.completed-label { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #16a34a; font-weight: 600; }
</style>