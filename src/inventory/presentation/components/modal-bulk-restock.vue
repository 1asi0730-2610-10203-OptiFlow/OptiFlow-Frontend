<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  articulos: { type: Array, default: () => [] }
})
const emit = defineEmits(['restock', 'close'])

const stockBajo = computed(() =>
    props.articulos.filter(i => i.stock <= i.nivelReorden)
)

const cantidades = ref(
    Object.fromEntries(
        props.articulos
            .filter(i => i.stock <= i.nivelReorden)
            .map(i => [i.product_id, String(i.nivelReorden - i.stock + 10)])
    )
)

function onSubmit() {
  Object.entries(cantidades.value).forEach(([id, qty]) => {
    const q = parseInt(qty)
    if (q > 0) emit('restock', { id: parseInt(id), qty: q, operacion: 'Reabastecimiento Masivo' })
  })
  emit('close')
}
</script>

<template>
  <div class="overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div>
          <h3 class="modal-title">Reabastecimiento Masivo</h3>
          <p class="modal-subtitle">Reponer todos los artículos con stock bajo</p>
        </div>
        <button class="close-btn" @click="emit('close')"><i class="pi pi-times" /></button>
      </div>
      <div class="modal-body">
        <div v-if="stockBajo.length === 0" class="empty-state">
          Todos los artículos tienen stock suficiente.
        </div>
        <div
            v-for="item in stockBajo"
            :key="item.product_id"
            class="item-row"
        >
          <div class="item-info">
            <p class="item-name">{{ item.nombre }}</p>
            <p class="item-stock">Stock: {{ item.stock }} / Mín: {{ item.nivelReorden }}</p>
          </div>
          <div class="item-qty">
            <span class="qty-label">Agregar:</span>
            <input
                v-model="cantidades[item.product_id]"
                type="number"
                min="0"
                class="qty-input"
            />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">Cancelar</button>
        <button v-if="stockBajo.length > 0" class="btn-restock" @click="onSubmit">Reponer Todo</button>
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
.btn-cancel { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #f9fafb; }
.btn-restock { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #16a34a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; }
.btn-restock:hover { opacity: 0.9; }
</style>