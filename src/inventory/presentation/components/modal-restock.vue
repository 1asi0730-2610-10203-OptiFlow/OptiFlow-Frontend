<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  articulo: { type: Object, required: true }
})
const emit = defineEmits(['restock', 'close'])

const qty = ref('')
const nota = ref('')

const nuevoStock = computed(() => {
  const q = parseInt(qty.value) || 0
  return q > 0 ? props.articulo.stock + q : null
})

function onSubmit() {
  const q = parseInt(qty.value)
  if (q > 0) {
    emit('restock', { id: props.articulo.product_id, qty: q, operacion: 'Reabastecimiento' })
    emit('close')
  }
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">Reabastecer Artículo</h3>
          <p class="modal-subtitle truncate">{{ articulo.nombre }}</p>
        </div>
        <button class="close-btn" @click="emit('close')"><i class="pi pi-times" /></button>
      </div>
      <div class="modal-body">
        <div class="stock-summary">
          <div>
            <p class="summary-label">Stock Actual</p>
            <p class="summary-value">{{ articulo.stock }} <span class="summary-unit">unid.</span></p>
          </div>
          <div>
            <p class="summary-label">Nivel de Reorden</p>
            <p class="summary-reorden">{{ articulo.nivelReorden }} unid.</p>
          </div>
        </div>
        <div class="field">
          <label>Cantidad a Agregar *</label>
          <input v-model="qty" type="number" min="1" class="form-input" placeholder="Ej. 50" required />
        </div>
        <div v-if="nuevoStock !== null" class="nuevo-stock-preview">
          <span class="preview-label">Nuevo nivel de stock</span>
          <span class="preview-value">{{ nuevoStock }} unidades</span>
        </div>
        <div class="field">
          <label>Notas (opcional)</label>
          <input v-model="nota" class="form-input" placeholder="Ej. OC #1234, entrega del proveedor" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">Cancelar</button>
        <button class="btn-restock" @click="onSubmit">Confirmar Restock</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; }
.stock-summary { background: rgba(150,246,238,0.2); border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.summary-label { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #6b7280; margin: 0 0 4px; }
.summary-value { font-family: 'Josefin Sans', sans-serif; font-size: 1.8rem; font-weight: 700; color: #111827; margin: 0; }
.summary-unit { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 400; color: #6b7280; }
.summary-reorden { font-family: 'Montserrat', sans-serif; font-size: 1.1rem; font-weight: 700; color: #ea580c; margin: 0; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.form-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: #00c1b0; }
.nuevo-stock-preview { background: #f0fdf4; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
.preview-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.preview-value { font-family: 'Montserrat', sans-serif; font-size: 0.88rem; font-weight: 700; color: #16a34a; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-restock { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #16a34a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-restock:hover { opacity: 0.9; }
</style>