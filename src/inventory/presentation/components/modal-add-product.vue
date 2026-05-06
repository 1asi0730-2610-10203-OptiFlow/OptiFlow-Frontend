<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  skusExistentes: { type: Array, default: () => [] }
})
const emit = defineEmits(['save', 'close'])

const categorias = ['Lunas', 'Armazones', 'Accesorios', 'Lentes de Contacto', 'Lentes de Sol', 'Equipos']
const proveedores = ['Vision Labs Inc.', 'OpticalPro Lab', 'Premium Optics Lab', 'Eye Care Supplies', 'Fashion Optics Co.', 'Budget Frames Inc.']

const form = ref({
  nombre: '', categoria: 'Lunas', sku: '',
  stock: '', nivelReorden: '', precioUnitario: '',
  proveedor: '', ultimoRestock: new Date().toISOString().split('T')[0]
})
const errorSku = ref('')

function onSubmit() {
  if (!form.value.nombre || !form.value.stock) return
  const skuFinal = form.value.sku.trim()
      ? form.value.sku.trim().toUpperCase()
      : `${form.value.categoria.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-6)}`
  if (form.value.sku.trim() && props.skusExistentes.includes(form.value.sku.trim().toUpperCase())) {
    errorSku.value = `SKU duplicado: "${form.value.sku.trim()}" ya está registrado en el catálogo.`
    return
  }
  emit('save', {
    product_id: 0,
    category_id: 0,
    supplier_id: 0,
    brand: '', model: '',
    nombre: form.value.nombre,
    categoria: form.value.categoria,
    sku: skuFinal,
    stock: parseInt(form.value.stock) || 0,
    nivelReorden: parseInt(form.value.nivelReorden) || 10,
    precioUnitario: parseFloat(form.value.precioUnitario) || 0,
    price: parseFloat(form.value.precioUnitario) || 0,
    proveedor: form.value.proveedor,
    ultimoRestock: form.value.ultimoRestock
  })
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">Agregar Artículo</h3>
          <p class="modal-subtitle">Registrar un nuevo producto en el inventario</p>
        </div>
        <button class="close-btn" @click="emit('close')"><i class="pi pi-times" /></button>
      </div>
      <div class="modal-body">
        <div class="field">
          <label>Nombre del Producto *</label>
          <input v-model="form.nombre" class="form-input" placeholder="Ej. Lunas Progresivas Premium" required />
        </div>
        <div class="form-row">
          <div class="field">
            <label>Categoría</label>
            <div class="select-wrapper">
              <select v-model="form.categoria" class="form-select">
                <option v-for="c in categorias" :key="c">{{ c }}</option>
              </select>
              <i class="pi pi-chevron-down select-arrow" />
            </div>
          </div>
          <div class="field">
            <label>SKU (opcional)</label>
            <input
                v-model="form.sku"
                class="form-input"
                :class="{ 'form-input--error': errorSku }"
                placeholder="Se genera automáticamente"
                @input="errorSku = ''"
            />
            <p v-if="errorSku" class="field-error">{{ errorSku }}</p>
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>Stock Inicial *</label>
            <input v-model="form.stock" type="number" min="0" class="form-input" placeholder="0" required />
          </div>
          <div class="field">
            <label>Nivel de Reorden</label>
            <input v-model="form.nivelReorden" type="number" min="0" class="form-input" placeholder="10" />
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>Precio Unit. (S/)</label>
            <input v-model="form.precioUnitario" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
          </div>
          <div class="field">
            <label>Fecha de Recepción</label>
            <input v-model="form.ultimoRestock" type="date" class="form-input" />
          </div>
        </div>
        <div class="field">
          <label>Proveedor</label>
          <div class="select-wrapper">
            <select v-model="form.proveedor" class="form-select">
              <option value="">Seleccionar proveedor...</option>
              <option v-for="p in proveedores" :key="p">{{ p }}</option>
            </select>
            <i class="pi pi-chevron-down select-arrow" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">Cancelar</button>
        <button class="btn-save" @click="onSubmit">Agregar Artículo</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; flex-shrink: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.form-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: #00c1b0; }
.form-input--error { border-color: #f87171; background: #fff5f5; }
.field-error { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #dc2626; margin: 0; }
.select-wrapper { position: relative; }
.form-select { width: 100%; padding: 9px 32px 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; background: #fff; outline: none; appearance: none; -webkit-appearance: none; cursor: pointer; transition: border-color 0.15s; }
.form-select:focus { border-color: #00c1b0; }
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; color: #9ca3af; pointer-events: none; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-save { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-save:hover { opacity: 0.9; }
</style>