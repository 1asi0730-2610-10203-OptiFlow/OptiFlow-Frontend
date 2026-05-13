<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  existingSkus: { type: Array, default: () => [] }
})
const emit = defineEmits(['save', 'close'])

const categories = ['Lunas', 'Armazones', 'Accesorios', 'Lentes de Contacto', 'Lentes de Sol', 'Equipos']
const suppliers = ['Vision Labs Inc.', 'OpticalPro Lab', 'Premium Optics Lab', 'Eye Care Supplies', 'Fashion Optics Co.', 'Budget Frames Inc.']

const form = ref({
  name: '', category: 'Lunas', sku: '',
  stock: '', minimumStockThreshold: '', price: '',
  supplierName: '', lastRestockDate: new Date().toISOString().split('T')[0]
})
const skuError = ref('')
const errors = ref({})
const submitted = ref(false)

function validate() {
  const e = {}
  if (!form.value.name.trim()) e.name = true
  if (!form.value.stock) e.stock = true
  errors.value = e
  return Object.keys(e).length === 0
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function onSubmit() {
  submitted.value = true
  if (!validate()) return
  const finalSku = form.value.sku.trim()
      ? form.value.sku.trim().toUpperCase()
      : `${form.value.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`
  if (form.value.sku.trim() && props.existingSkus.includes(form.value.sku.trim().toUpperCase())) {
    skuError.value = `${t('inventory.addModal.skuDuplicate')} "${form.value.sku.trim()}"`
    return
  }
  emit('save', {
    category_id:             0,
    supplier_id:             0,
    brand:                   '',
    model:                   '',
    name:                    form.value.name,
    category:                form.value.category,
    sku:                     finalSku,
    stock:                   parseInt(form.value.stock) || 0,
    minimum_stock_threshold: parseInt(form.value.minimumStockThreshold) || 10,
    price:                   parseFloat(form.value.price) || 0,
    supplier_name:           form.value.supplierName,
    last_restock_date:       form.value.lastRestockDate
  })
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">{{ $t('inventory.addModal.title') }}</h3>
          <p class="modal-subtitle">{{ $t('inventory.addModal.subtitle') }}</p>
        </div>
        <button class="close-btn" @click="emit('close')">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label>{{ $t('inventory.addModal.productName') }} *</label>
          <input
              v-model="form.name"
              class="form-input"
              :class="{ 'form-input--error': errors.name }"
              :placeholder="$t('inventory.addModal.productNamePlaceholder')"
              @input="errors.name = false"
          />
        </div>

        <div class="form-row">
          <div class="field">
            <label>{{ $t('inventory.addModal.category') }}</label>
            <div class="select-wrapper">
              <select v-model="form.category" class="form-select">
                <option v-for="category in categories" :key="category">{{ category }}</option>
              </select>
              <i class="pi pi-chevron-down select-arrow" />
            </div>
          </div>
          <div class="field">
            <label>{{ $t('inventory.addModal.sku') }}</label>
            <input
                v-model="form.sku"
                class="form-input"
                :class="{ 'form-input--error': skuError }"
                :placeholder="$t('inventory.addModal.skuPlaceholder')"
                @input="skuError = ''"
            />
            <p v-if="skuError" class="field-error">{{ skuError }}</p>
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label>{{ $t('inventory.addModal.initialStock') }} *</label>
            <input 
              v-model="form.stock" 
              type="number" 
              min="0" 
              class="form-input" 
              :class="{ 'form-input--error': errors.stock }"
              placeholder="0" 
              @input="errors.stock = false"
            />
          </div>
          <div class="field">
            <label>{{ $t('inventory.addModal.reorderLevel') }}</label>
            <input v-model="form.minimumStockThreshold" type="number" min="0" class="form-input" placeholder="10" />
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label>{{ $t('inventory.addModal.unitPrice') }}</label>
            <input v-model="form.price" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
          </div>
          <div class="field">
            <label>{{ $t('inventory.addModal.receptionDate') }}</label>
            <input v-model="form.lastRestockDate" type="date" class="form-input" />
          </div>
        </div>

        <div class="field">
          <label>{{ $t('inventory.addModal.supplier') }}</label>
          <div class="select-wrapper">
            <select v-model="form.supplierName" class="form-select">
              <option value="">{{ $t('inventory.addModal.selectSupplier') }}</option>
              <option v-for="supplier in suppliers" :key="supplier">{{ supplier }}</option>
            </select>
            <i class="pi pi-chevron-down select-arrow" />
          </div>
        </div>

        <p v-if="submitted && hasErrors" style="color: #dc2626; font-size: 0.8rem; font-family: Montserrat; margin: 0;">
          {{ $t('common.requiredError') }}
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">{{ $t('common.cancel') }}</button>
        <button class="btn-save" @click="onSubmit">{{ $t('inventory.addModal.addItem') }}</button>
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