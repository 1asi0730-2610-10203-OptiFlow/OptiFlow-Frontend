<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
    message: { type: String, required: true }
})
const emit = defineEmits(['next'])
</script>

<template>
    <div class="overlay">
        <div class="modal">
            <div class="success-body">
                <i class="pi pi-check-circle success-icon" />
                <p class="success-text">{{ message }}</p>
            </div>
            <button class="btn-next" @click="emit('next')">
                {{ $t('patients.success.next') }} <i class="pi pi-arrow-right" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 60; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.success-body { padding: 64px 40px 32px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.success-icon { font-size: 2.4rem; color: #111827; }
.success-text { font-family: 'Josefin Sans', sans-serif; font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0; text-align: center; }
.btn-next { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px; border: none; background: #00c1b0; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-next:hover { opacity: 0.9; }
</style>
