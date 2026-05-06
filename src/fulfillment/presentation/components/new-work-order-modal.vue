<script setup>
import { ref, computed } from 'vue'
import { WorkOrder } from '../../domain/model/work-order.entity.js'

const emit = defineEmits(['save', 'close'])

const tiposLuna = [
  'Lunas Progresivas', 'Lunas Monofocales', 'Lunas Bifocales',
  'Lunas con Filtro Azul', 'Lunas Polarizadas', 'Lunas Antireflejantes', 'Lentes de Contacto'
]
const laboratorios = ['Vision Labs Inc.', 'OpticalPro Lab', 'Premium Optics Lab']
const pacientes = ['Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Martínez', 'Lisa Anderson', 'Carlos Rivera']

const form = ref({
  paciente: '', laboratorio: 'Vision Labs Inc.', tipo: 'Lunas Progresivas',
  od_esfera: '', od_cilindro: '', od_eje: '',
  os_esfera: '', os_cilindro: '', os_eje: '',
  armazon: '', fechaOrden: new Date().toISOString().split('T')[0],
  fechaEsperada: '', prioridad: 'normal',
  adelanto: '', total: ''
})

const totalNum = computed(() => parseFloat(form.value.total) || 0)
const adelantoNum = computed(() => parseFloat(form.value.adelanto) || 0)
const saldoPendiente = computed(() => Math.max(0, totalNum.value - adelantoNum.value))

function buildReceta() {
  const od = form.value.od_esfera
      ? `OD: Esf ${form.value.od_esfera}${form.value.od_cilindro ? `, Cil ${form.value.od_cilindro}` : ''}${form.value.od_eje ? `, Eje ${form.value.od_eje}` : ''}`
      : ''
  const os = form.value.os_esfera
      ? `OS: Esf ${form.value.os_esfera}${form.value.os_cilindro ? `, Cil ${form.value.os_cilindro}` : ''}${form.value.os_eje ? `, Eje ${form.value.os_eje}` : ''}`
      : ''
  return [od, os].filter(Boolean).join(' | ') || 'Sin receta ingresada'
}

function onSubmit() {
  if (!form.value.paciente || !form.value.fechaEsperada) return
  const wo = new WorkOrder({
    id: 0,
    saleId: 0,
    recipeId: 0,
    labId: 0,
    status: 'PENDING',
    deliveryDate: form.value.fechaEsperada
  })
  wo.paciente = form.value.paciente
  wo.laboratorio = form.value.laboratorio
  wo.tipo = form.value.tipo
  wo.armazon = form.value.armazon || 'Sin Montura'
  wo.receta = buildReceta()
  wo.prioridad = form.value.prioridad
  wo.adelanto = adelantoNum.value
  wo.total = totalNum.value
  wo.patientName = form.value.paciente
  emit('save', wo)
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">Nueva Orden de Lab</h3>
          <p class="modal-subtitle">Crear una nueva orden de trabajo</p>
        </div>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Paciente y Laboratorio -->
        <div class="form-row">
          <div class="field">
            <label>Paciente *</label>
            <select v-model="form.paciente" class="form-select" required>
              <option value="">Seleccionar paciente...</option>
              <option v-for="p in pacientes" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="field">
            <label>Laboratorio</label>
            <select v-model="form.laboratorio" class="form-select">
              <option v-for="l in laboratorios" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>
        </div>

        <!-- Tipo y Prioridad -->
        <div class="form-row">
          <div class="field">
            <label>Tipo de Luna</label>
            <select v-model="form.tipo" class="form-select">
              <option v-for="t in tiposLuna" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="field">
            <label>Prioridad</label>
            <select v-model="form.prioridad" class="form-select">
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        <!-- Receta -->
        <div class="recipe-section">
          <label class="recipe-label">
            <i class="pi pi-eye" style="color: #00c1b0" /> Receta Óptica
          </label>
          <div class="recipe-grid-wrapper">
            <div class="recipe-header-row">
              <span class="recipe-col-label">Ojo</span>
              <span class="recipe-col-label">Esfera</span>
              <span class="recipe-col-label">Cilindro</span>
              <span class="recipe-col-label">Eje</span>
            </div>
            <div class="recipe-data-row">
              <span class="eye-label">OD (Der)</span>
              <input v-model="form.od_esfera"   class="recipe-input" placeholder="-2.50" />
              <input v-model="form.od_cilindro" class="recipe-input" placeholder="-0.75" />
              <input v-model="form.od_eje"      class="recipe-input" placeholder="90" />
            </div>
            <div class="recipe-data-row">
              <span class="eye-label">OS (Izq)</span>
              <input v-model="form.os_esfera"   class="recipe-input" placeholder="-2.75" />
              <input v-model="form.os_cilindro" class="recipe-input" placeholder="-0.50" />
              <input v-model="form.os_eje"      class="recipe-input" placeholder="85" />
            </div>
          </div>
        </div>

        <!-- Armazón y Fechas -->
        <div class="form-row form-row--3">
          <div class="field">
            <label>Armazón</label>
            <input v-model="form.armazon" class="form-input" placeholder="Ej. Ray-Ban RB5228" />
          </div>
          <div class="field">
            <label>Fecha de Orden</label>
            <input v-model="form.fechaOrden" type="date" class="form-input" />
          </div>
          <div class="field">
            <label>Fecha de Entrega *</label>
            <input v-model="form.fechaEsperada" type="date" class="form-input" required />
          </div>
        </div>

        <!-- Totales -->
        <div class="form-row">
          <div class="field">
            <label>Total (S/)</label>
            <input v-model="form.total" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
          </div>
          <div class="field">
            <label>Adelanto (S/)</label>
            <input v-model="form.adelanto" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
          </div>
        </div>

        <!-- Saldo -->
        <div v-if="totalNum > 0" class="saldo-preview">
          <span class="saldo-preview-label">Saldo pendiente tras adelanto</span>
          <span class="saldo-preview-value" :class="saldoPendiente > 0 ? 'saldo--orange' : 'saldo--green'">
            S/ {{ saldoPendiente.toFixed(2) }}
          </span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">Cancelar</button>
        <button class="btn-save" @click="onSubmit">Crear Orden de Lab</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.15rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row--3 { grid-template-columns: 1fr 1fr 1fr; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.form-select, .form-input {
  padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827;
  outline: none; background: #fff; transition: border-color 0.15s;
}
.form-select:focus, .form-input:focus { border-color: #00c1b0; }
.recipe-section { display: flex; flex-direction: column; gap: 8px; }
.recipe-label { display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; }
.recipe-grid-wrapper { background: rgba(150,246,238,0.2); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.recipe-header-row, .recipe-data-row { display: grid; grid-template-columns: 80px 1fr 1fr 1fr; gap: 8px; align-items: center; }
.recipe-col-label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700; color: #00c1b0; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }
.recipe-col-label:first-child { text-align: left; }
.eye-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.recipe-input {
  padding: 6px 8px; border: 1px solid #fff; border-radius: 8px;
  font-family: 'Courier New', monospace; font-size: 0.82rem; text-align: center;
  background: #fff; outline: none; transition: border-color 0.15s;
}
.recipe-input:focus { border-color: #00c1b0; }
.saldo-preview { background: #f9fafb; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
.saldo-preview-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.saldo-preview-value { font-family: 'Montserrat', sans-serif; font-size: 0.88rem; font-weight: 700; }
.saldo--orange { color: #ea580c; }
.saldo--green  { color: #16a34a; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; flex-shrink: 0; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-save { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-save:hover { opacity: 0.9; }
</style>