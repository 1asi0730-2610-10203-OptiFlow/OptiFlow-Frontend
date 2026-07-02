<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'

const { t } = useI18n()

const props = defineProps({
  products: { type: Array, default: () => [] }
})
const emit = defineEmits(['restock', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const lowStockItems = computed(() =>
    props.products.filter(product => product.stock <= product.minimumStockThreshold)
)

const quantities = ref(
    Object.fromEntries(
        props.products
            .filter(product => product.stock <= product.minimumStockThreshold)
            .map(product => [product.id, String(product.minimumStockThreshold - product.stock + 10)])
    )
)

const errors = ref({})
const submitted = ref(false)

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function validate() {
  const e = {}
  Object.entries(quantities.value).forEach(([id, qty]) => {
    const quantity = parseInt(qty)
    if (!qty || isNaN(quantity) || quantity <= 0) {
      e[id] = true
    }
  })
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  submitted.value = true
  if (!validate()) return

  Object.entries(quantities.value).forEach(([id, qty]) => {
    const quantity = parseInt(qty)
    emit('restock', { id: parseInt(id), qty: quantity, operation: 'Bulk Restock' })
  })
  requestClose()
}
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">{{ $t('inventory.bulkRestockModal.title') }}</h3>
          <p class="modal-subtitle">{{ $t('inventory.bulkRestockModal.subtitle') }}</p>
        </div>
        <button class="close-btn" @click="requestClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="lowStockItems.length === 0" class="empty-state">
          {{ $t('inventory.bulkRestockModal.allSufficient') }}
        </div>
        <div
            v-for="product in lowStockItems"
            :key="product.id"
            class="item-row"
        >
          <div class="item-info">
            <p class="item-name">{{ product.name }}</p>
            <p class="item-stock">
              {{ $t('inventory.table.stock') }}: {{ product.stock }} /
              {{ $t('inventory.table.min') }}: {{ product.minimumStockThreshold }}
            </p>
          </div>
          <div class="item-qty">
            <span class="qty-label">{{ $t('inventory.bulkRestockModal.add') }}:</span>
            <input
                v-model="quantities[product.id]"
                type="number"
                min="1"
                class="qty-input"
                :class="{ 'qty-input--error': errors[product.id] }"
                @input="errors[product.id] = false"
            />
          </div>
        </div>

        <p v-if="submitted && hasErrors" style="color: #dc2626; font-size: 0.8rem; font-family: Montserrat; margin: 10px 0 0; text-align: center;">
          {{ $t('common.requiredError') }}
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="requestClose">{{ $t('common.cancel') }}</button>
        <button v-if="lowStockItems.length > 0" class="btn-restock" @click="onSubmit">
          {{ $t('inventory.bulkRestockModal.replenishAll') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
.modal-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 4px 0 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; }
.modal-footer { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; }
.empty-state { text-align: center; padding: 32px 0; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #9ca3af; }
.item-row { background: #f9fafb; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #111827; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-stock { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #ef4444; margin: 2px 0 0; }
.item-qty { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.qty-label { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; }
.qty-input { width: 72px; padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; text-align: center; outline: none; transition: border-color 0.15s; }
.qty-input:focus { border-color: #00c1b0; }
.qty-input--error { border-color: #f87171 !important; background-color: #fff5f5 !important; }
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-restock { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #16a34a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-restock:hover { opacity: 0.9; }
</style>