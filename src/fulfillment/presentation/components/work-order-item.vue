<script setup>
const props = defineProps({
  workOrder: { type: Object, required: true }
})
const emit = defineEmits(['statusChanged', 'click'])

const SIGUIENTE_ESTADO = {
  PENDING:         'IN_PRODUCTION',
  IN_PRODUCTION:   'QUALITY_CONTROL',
  QUALITY_CONTROL: 'READY',
  READY:           'DELIVERED',
  DELIVERED:       null
}

const SIGUIENTE_LABELS = {
  IN_PRODUCTION:   'Biselado',
  QUALITY_CONTROL: 'QC',
  READY:           'Listo',
  DELIVERED:       'Entregar'
}

function onAdvance(e) {
  e.stopPropagation()
  const next = SIGUIENTE_ESTADO[props.workOrder.status]
  if (next) emit('statusChanged', next)
}

function saldo() {
  return (props.workOrder.total || 0) - (props.workOrder.adelanto || 0)
}
</script>

<template>
  <div
      class="card"
      :class="{ 'card--rework': workOrder.retrabajo }"
      @click="emit('click', workOrder)"
  >
    <!-- Banner retrabajo -->
    <div v-if="workOrder.retrabajo" class="rework-banner">⚠ RETRABAJO</div>

    <!-- Top: ID + paciente + tipo | badge prioridad -->
    <div class="card-top">
      <div class="card-main" @click.stop="emit('click', workOrder)">
        <p class="card-id">{{ workOrder.id }}</p>
        <p class="card-patient">{{ workOrder.paciente }}</p>
        <p class="card-tipo">{{ workOrder.tipo }}</p>
      </div>
      <span
          v-if="workOrder.prioridad && workOrder.prioridad !== 'normal'"
          class="priority-badge"
          :class="workOrder.prioridad === 'urgente' ? 'badge--urgent' : 'badge--high'"
      >
        {{ workOrder.prioridad === 'urgente' ? 'URGENTE' : 'ALTA' }}
      </span>
    </div>

    <!-- Info: Lab, Armazón, Entrega -->
    <div class="card-info">
      <p class="info-line"><span class="info-key">Lab:</span> {{ workOrder.laboratorio }}</p>
      <p class="info-line"><span class="info-key">Armazón:</span> {{ workOrder.armazon }}</p>
      <p class="info-line"><span class="info-key">Entrega:</span> {{ workOrder.deliveryDate || workOrder.fechaEsperada }}</p>
    </div>

    <!-- Footer: saldo + avanzar -->
    <div class="card-footer">
      <span v-if="saldo() > 0" class="saldo-pending">Saldo: S/ {{ saldo().toFixed(2) }}</span>
      <span v-else class="saldo-paid">✓ Pagado</span>
      <button
          v-if="SIGUIENTE_ESTADO[workOrder.status]"
          class="advance-btn"
          @click="onAdvance"
      >
        → {{ SIGUIENTE_LABELS[SIGUIENTE_ESTADO[workOrder.status]] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff; border-radius: 10px; padding: 12px;
  border: 1px solid #e5e7eb; cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: box-shadow 0.15s;
  display: flex; flex-direction: column; gap: 8px;
}
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card--rework { border-color: #fca5a5; background: #fff5f5; }

.rework-banner {
  font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700;
  color: #dc2626; background: #fee2e2; border-radius: 6px; padding: 4px 8px;
}

.card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.card-id { font-family: 'Courier New', monospace; font-size: 0.72rem; color: #9ca3af; margin: 0; }
.card-patient { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; color: #111827; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-tipo { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #6b7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.priority-badge {
  font-family: 'Montserrat', sans-serif; font-size: 0.68rem; font-weight: 700;
  padding: 2px 7px; border-radius: 6px; white-space: nowrap; flex-shrink: 0;
}
.badge--urgent { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
.badge--high   { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }

.card-info { display: flex; flex-direction: column; gap: 3px; }
.info-line { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.info-key { font-weight: 600; color: #374151; }

.card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 8px; border-top: 1px solid #f3f4f6;
}
.saldo-pending { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 600; color: #ea580c; }
.saldo-paid    { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 600; color: #16a34a; }
.advance-btn {
  font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 600;
  color: #00c1b0; background: none; border: none; cursor: pointer;
  opacity: 0; transition: opacity 0.15s; padding: 0;
}
.card:hover .advance-btn { opacity: 1; }
</style>