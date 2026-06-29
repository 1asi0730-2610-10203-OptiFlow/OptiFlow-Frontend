<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalAnimation } from '../../../shared/presentation/composables/use-modal-animation.js'

const { t } = useI18n()

const props = defineProps({
  workOrder: { type: Object, required: true }
})

const emit = defineEmits(['approved', 'rejected', 'close'])
const { isClosing, requestClose, onOverlayAnimEnd } = useModalAnimation(emit)

const checks = ref({
  sphereMatch:  false,
  cylinderAxis: false,
  noScratches:  false,
  coatingOk:     false,
  centeredLens:  false,
  powerVerified: false,
  frameOk:       false,
  bevelOk:       false,
  adjustmentOk:  false
})

const allChecked = computed(() => Object.values(checks.value).every(Boolean))
</script>

<template>
  <div class="overlay" :class="{ 'overlay--closing': isClosing }" @click="requestClose" @animationend.self="onOverlayAnimEnd">
    <div class="modal" @click.stop>

      <!-- Header -->
      <div class="modal-header">
        <div>
          <p class="modal-subtitle">{{ $t('labOrders.qaModal.subtitle') }}</p>
          <h3 class="modal-title">{{ $t('labOrders.qaModal.title') }}</h3>
          <p class="order-ref">
            <span class="order-id">{{ workOrder.id }}</span>
            &nbsp;·&nbsp;
            <span class="order-patient">{{ workOrder.patientName }}</span>
          </p>
        </div>
        <button class="close-btn" @click="requestClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">

        <!-- Bloque 1: Verificación de Receta -->
        <div class="section section--recipe">
          <p class="section-label">
            <i class="pi pi-eye section-icon section-icon--teal" />
            {{ $t('labOrders.qaModal.prescriptionCheck') }}
          </p>
          <div class="check-list">
            <label
                v-for="key in ['sphereMatch', 'cylinderAxis']"
                :key="key"
                class="check-item"
            >
              <input type="checkbox" v-model="checks[key]" class="check-input" />
              <span class="check-mark" :class="{ 'check-mark--checked': checks[key] }">
                <i v-if="checks[key]" class="pi pi-check check-icon" />
              </span>
              <span class="check-label">{{ $t(`labOrders.qaModal.checks.${key}`) }}</span>
            </label>
          </div>
        </div>

        <!-- Bloque 2: Inspección del Lente -->
        <div class="section">
          <p class="section-label">
            <i class="pi pi-circle section-icon section-icon--purple" />
            {{ $t('labOrders.qaModal.lensInspection') }}
          </p>
          <div class="check-list">
            <label
                v-for="key in ['noScratches', 'coatingOk', 'centeredLens', 'powerVerified']"
                :key="key"
                class="check-item"
            >
              <input type="checkbox" v-model="checks[key]" class="check-input" />
              <span class="check-mark" :class="{ 'check-mark--checked': checks[key] }">
                <i v-if="checks[key]" class="pi pi-check check-icon" />
              </span>
              <span class="check-label">{{ $t(`labOrders.qaModal.checks.${key}`) }}</span>
            </label>
          </div>
        </div>

        <!-- Bloque 3: Inspección de Montura -->
        <div class="section">
          <p class="section-label">
            <i class="pi pi-box section-icon section-icon--gray" />
            {{ $t('labOrders.qaModal.frameInspection') }}
          </p>
          <div class="check-list">
            <label
                v-for="key in ['frameOk', 'bevelOk', 'adjustmentOk']"
                :key="key"
                class="check-item"
            >
              <input type="checkbox" v-model="checks[key]" class="check-input" />
              <span class="check-mark" :class="{ 'check-mark--checked': checks[key] }">
                <i v-if="checks[key]" class="pi pi-check check-icon" />
              </span>
              <span class="check-label">{{ $t(`labOrders.qaModal.checks.${key}`) }}</span>
            </label>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="requestClose">
          {{ $t('common.cancel') }}
        </button>
        <button class="btn-reject" @click="emit('rejected')">
          <i class="pi pi-times" />
          {{ $t('labOrders.qaModal.btnReject') }}
        </button>
        <button
            class="btn-approve"
            :disabled="!allChecked"
            @click="emit('approved')"
        >
          <i class="pi pi-check" />
          {{ $t('labOrders.qaModal.btnApprove') }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 50; display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.modal {
  background: #fff; border-radius: 16px; width: 100%; max-width: 560px;
  max-height: 90vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
}
.modal-subtitle {
  font-family: 'Montserrat', sans-serif; font-size: 0.72rem;
  color: #9ca3af; margin: 0; text-transform: uppercase; letter-spacing: 0.04em;
}
.modal-title {
  font-family: 'Josefin Sans', sans-serif; font-size: 1.15rem;
  font-weight: 700; color: #111827; margin: 2px 0 4px;
}
.order-ref  { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; color: #6b7280; margin: 0; }
.order-id   { font-family: 'Courier New', monospace; font-weight: 700; color: #374151; }
.close-btn  { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #6b7280; flex-shrink: 0; }
.close-btn:hover { background: #f3f4f6; }

.modal-body {
  padding: 20px 24px; display: flex; flex-direction: column;
  gap: 14px; overflow-y: auto; flex: 1;
}

.section {
  background: #f9fafb; border-radius: 10px; padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.section--recipe { background: rgba(150,246,238,0.18); }

.section-label {
  font-family: 'Montserrat', sans-serif; font-size: 0.74rem; font-weight: 700;
  color: #374151; margin: 0; display: flex; align-items: center; gap: 6px;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.section-icon         { font-size: 0.8rem; }
.section-icon--teal   { color: #00c1b0; }
.section-icon--purple { color: #7c3aed; }
.section-icon--gray   { color: #9ca3af; }

.check-list  { display: flex; flex-direction: column; gap: 8px; }
.check-item  { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.check-input { display: none; }

.check-mark {
  width: 20px; height: 20px; border-radius: 6px; border: 2px solid #d1d5db;
  background: #fff; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s;
}
.check-mark--checked          { background: #00c1b0; border-color: #00c1b0; }
.check-icon                   { font-size: 0.7rem; color: #fff; }
.check-item:hover .check-mark { border-color: #00c1b0; }
.check-label { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #374151; line-height: 1.4; }

.modal-footer {
  display: flex; gap: 8px; padding: 16px 24px;
  border-top: 1px solid #f3f4f6; flex-shrink: 0;
}
.btn-cancel {
  flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem;
  font-weight: 600; color: #374151; cursor: pointer; transition: background 0.15s;
}
.btn-cancel:hover { background: #f3f4f6; }

.btn-reject {
  flex: 1; padding: 10px; border: 1px solid #fca5a5; border-radius: 8px;
  background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem;
  font-weight: 600; color: #dc2626; cursor: pointer; transition: background 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-reject:hover { background: #fef2f2; }

.btn-approve {
  flex: 1; padding: 10px; border: none; border-radius: 8px;
  background: #00c1b0; font-family: 'Montserrat', sans-serif; font-size: 0.84rem;
  font-weight: 600; color: #fff; cursor: pointer; transition: opacity 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-approve:hover:not(:disabled) { opacity: 0.9; }
.btn-approve:disabled { background: #d1d5db; cursor: not-allowed; }

@media (max-width: 480px) {
  .modal-header { padding: 16px; }
  .modal-body   { padding: 16px; }
  .modal-footer { padding: 12px 16px; flex-wrap: wrap; }
  .btn-approve  { flex: 1 1 100%; order: -1; }
}
</style>