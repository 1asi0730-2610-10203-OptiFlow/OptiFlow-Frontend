<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'

const { t } = useI18n()

const props = defineProps({
  product: { type: Object, required: true }
})
const emit = defineEmits(['restock', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const quantity = ref('')
const notes = ref('')

const newStock = computed(() => {
  const qty = parseInt(quantity.value) || 0
  return qty > 0 ? props.product.stock + qty : null
})

const errors = ref({})
const submitted = ref(false)

function validate() {
  const e = {}
  const qty = parseInt(quantity.value)
  if (!quantity.value || qty <= 0 || qty > 1000000) e.quantity = true
  errors.value = e
  return Object.keys(e).length === 0
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function onSubmit() {
  submitted.value = true
  if (!validate()) return
  const qty = parseInt(quantity.value)
  emit('restock', { id: props.product.id, qty, operation: 'Restock' })
  requestClose()
}
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">{{ $t('inventory.restockModal.title') }}</h3>
          <p class="modal-subtitle">{{ product.name }}</p>
        </div>
        <button class="close-btn" @click="requestClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">
        <div class="stock-summary">
          <div>
            <p class="summary-label">{{ $t('inventory.restockModal.currentStock') }}</p>
            <p class="summary-value">
              {{ product.stock }}
              <span class="summary-unit">{{ $t('inventory.restockModal.units') }}</span>
            </p>
          </div>
          <div>
            <p class="summary-label">{{ $t('inventory.restockModal.reorderLevel') }}</p>
            <p class="summary-reorder">
              {{ product.minimumStockThreshold }} {{ $t('inventory.restockModal.units') }}
            </p>
          </div>
        </div>

        <div class="field">
          <label>{{ $t('inventory.restockModal.quantityToAdd') }} *</label>
          <input
              v-model="quantity"
              type="number"
              min="1"
              max="1000000"
              class="form-input"
              :class="{ 'form-input--error': errors.quantity }"
              :placeholder="$t('inventory.restockModal.quantityPlaceholder')"
              @input="errors.quantity = false"
          />
        </div>

        <div v-if="newStock !== null" class="new-stock-preview">
          <span class="preview-label">{{ $t('inventory.restockModal.newStockLevel') }}</span>
          <span class="preview-value">
            {{ newStock }} {{ $t('inventory.restockModal.units_full') }}
          </span>
        </div>

        <div class="field">
          <label>{{ $t('inventory.restockModal.notes') }}</label>
          <input
              v-model="notes"
              class="form-input"
              :placeholder="$t('inventory.restockModal.notesPlaceholder')"
          />
        </div>

        <p v-if="submitted && hasErrors" style="color: #dc2626; font-size: 0.8rem; font-family: Montserrat; margin: 10px 0 0;">
          {{ $t('common.requiredError') }}
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="requestClose">{{ $t('common.cancel') }}</button>
        <button class="btn-restock" @click="onSubmit">
          {{ $t('inventory.restockModal.confirmRestock') }}
        </button>
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
.summary-reorder { font-family: 'Montserrat', sans-serif; font-size: 1.1rem; font-weight: 700; color: #ea580c; margin: 0; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 600; color: #374151; }
.form-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #111827; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: #00c1b0; }
.form-input--error { border-color: #f87171 !important; background-color: #fff5f5 !important; }
.new-stock-preview { background: #f0fdf4; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
.preview-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.preview-value { font-family: 'Montserrat', sans-serif; font-size: 0.88rem; font-weight: 700; color: #16a34a; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-restock { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #16a34a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-restock:hover { opacity: 0.9; }
</style>