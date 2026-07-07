<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'
import { PRODUCT_CATEGORIES } from '../../domain/model/product-categories.js'

const { t } = useI18n()

const props = defineProps({
  product: { type: Object, required: true }
})
const emit = defineEmits(['save', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const form = ref({
  name:                   '',
  sku:                    '',
  category:               '',
  minimumStockThreshold:  '',
  price:                  ''
})
const errors = ref({})

watch(() => props.product, (p) => {
  form.value = {
    name:                  p.name                 || '',
    sku:                   p.sku                  || '',
    category:              p.category             || 'Lenses',
    minimumStockThreshold: p.minimumStockThreshold || '',
    price:                 p.price                || ''
  }
}, { immediate: true })

function onSubmit() {
  const e = {}
  if (!form.value.name) e.name = true
  const priceNum = parseFloat(form.value.price)
  if (!form.value.price || isNaN(priceNum) || priceNum <= 0 || priceNum > 1000000) e.price = true
  errors.value = e
  if (Object.keys(e).length > 0) return
  emit('save', {
    ...props.product,
    name:                  form.value.name,
    sku:                   form.value.sku,
    category:              form.value.category,
    minimumStockThreshold: parseInt(form.value.minimumStockThreshold) || 0,
    price:                 parseFloat(form.value.price) || 0
  })
}
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>

      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon"><i class="pi pi-file-edit" /></div>
          <div>
            <h3 class="modal-title">{{ $t('inventory.editModal.title') }}</h3>
            <p class="modal-subtitle">{{ $t('inventory.editModal.subtitle') }}</p>
          </div>
        </div>
        <button class="close-btn" @click="requestClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label>{{ $t('inventory.editModal.productName') }}</label>
          <input v-model="form.name" class="form-input" placeholder="Nombre del producto" />
        </div>

        <div class="form-row">
          <div class="field">
            <label>{{ $t('inventory.editModal.sku') }}</label>
            <input v-model="form.sku" class="form-input" placeholder="SKU" />
          </div>
          <div class="field">
            <label>{{ $t('inventory.editModal.category') }}</label>
            <div class="select-wrapper">
              <select v-model="form.category" class="form-select">
                <option v-for="cat in PRODUCT_CATEGORIES" :key="cat.value" :value="cat.value">{{ $t(cat.labelKey) }}</option>
              </select>
              <i class="pi pi-chevron-down select-arrow" />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label>{{ $t('inventory.editModal.threshold') }}</label>
            <input v-model="form.minimumStockThreshold" type="number" min="0" max="1000000" class="form-input" placeholder="0" />
          </div>
          <div class="field">
            <label>{{ $t('inventory.editModal.price') }}</label>
            <input
              v-model="form.price"
              type="number"
              min="0.01"
              max="1000000"
              step="0.01"
              class="form-input"
              :class="{ 'form-input--error': errors.price }"
              placeholder="0.00"
              @input="errors.price = false"
            />
            <p v-if="errors.price" class="field-error">{{ $t('inventory.editModal.priceError') }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-save" @click="onSubmit">{{ $t('inventory.editModal.save') }}</button>      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; background: #f0fdf9; border-radius: 16px 16px 0 0; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(0,193,176,0.15); color: #00c1b0; display: flex; align-items: center; justify-content: center; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #e5e7eb; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; font-weight: 700; color: #6b7280; letter-spacing: 0.05em; }
.form-input { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: #111827; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: #00c1b0; }
.form-input--error { border-color: #f87171; background: #fff5f5; }
.field-error { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #dc2626; margin: 0; }
.select-wrapper { position: relative; }
.form-select { width: 100%; padding: 10px 32px 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: #111827; background: #fff; outline: none; appearance: none; cursor: pointer; }
.form-select:focus { border-color: #00c1b0; }
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; color: #9ca3af; pointer-events: none; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; }
.btn-save { width: 100%; padding: 14px; border: none; border-radius: 10px; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; }
.btn-save:hover { opacity: 0.9; }
</style>