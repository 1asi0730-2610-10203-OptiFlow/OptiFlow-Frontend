<script setup>
import { ref } from 'vue'

const frames = ref([
  { id: 1, name: 'Aviator Classic', material: 'Metal · Dorado', price: '299', selected: true },
  { id: 2, name: 'Wayfarer Bold', material: 'Acetato · Negro', price: '349', selected: false },
  { id: 3, name: 'Round Vintage', material: 'Metal · Plata', price: '279', selected: false },
  { id: 4, name: 'Cat-Eye Modern', material: 'Acetato · Rojo', price: '329', selected: false },
])

const selectedFrameId = ref(1)

function selectFrame(id) {
  selectedFrameId.value = id
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Probador Virtual</h1>
        <p class="page-subtitle">Bienvenido/a a tu portal OptiFlow</p>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="tryon-container">
      
      <!-- Lado Izquierdo: Cámara -->
      <div class="card camera-section">
        <div class="card-header">
          <div class="camera-title-wrapper">
             <div class="avatar" style="background: rgba(0,193,176,0.1);"><i class="pi pi-eye" /></div>
             <div>
               <h3 class="card-title">Probador Virtual 3D</h3>
               <p class="card-subtitle">Pruébate monturas en tiempo real</p>
             </div>
          </div>
        </div>
        
        <div class="camera-placeholder">
          <i class="pi pi-camera camera-large-icon" />
          <h2 class="activate-text">Activa tu cámara</h2>
          <p class="activate-subtext">Para comenzar a probar monturas, necesitamos acceso a tu cámara</p>
          <button class="btn-activate">
            <i class="pi pi-camera" /> Activar Cámara
          </button>
        </div>
      </div>

      <!-- Lado Derecho: Selección de Montura -->
      <div class="frames-selection">
        <p class="selection-label">Selecciona una montura</p>
        <div 
          v-for="frame in frames" 
          :key="frame.id" 
          class="frame-card" 
          :class="{ 'frame-card--active': selectedFrameId === frame.id }"
          @click="selectFrame(frame.id)"
        >
          <div class="frame-info">
            <span class="frame-name">{{ frame.name }}</span>
            <span class="frame-material">{{ frame.material }}</span>
            <span class="frame-price">S/ {{ frame.price }}</span>
          </div>
          <i v-if="selectedFrameId === frame.id" class="pi pi-check-circle check-icon" />
        </div>
      </div>

    </div>

    <!-- Sección de Consejos (Abajo) -->
    <div class="tips-card">
       <i class="pi pi-info-circle tips-icon" />
       <div>
         <p class="tips-title">Consejos para mejor experiencia</p>
         <ul class="tips-list">
           <li>Mantén tu rostro centrado en la cámara</li>
           <li>Asegúrate de tener buena iluminación frontal</li>
           <li>Evita movimientos bruscos para mejor detección</li>
         </ul>
       </div>
    </div>
  </div>
</template>

<style scoped>
.tryon-container { display: grid; grid-template-columns: 1fr 300px; gap: 24px; margin-top: 20px; }

/* Sección Cámara */
.camera-placeholder { 
  background: #111827; margin: 20px; border-radius: 12px; height: 350px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: white; text-align: center; padding: 20px;
}
.camera-large-icon { font-size: 3rem; opacity: 0.5; margin-bottom: 15px; }
.activate-text { font-family: 'Josefin Sans', sans-serif; margin: 0; }
.activate-subtext { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; opacity: 0.7; max-width: 250px; margin: 10px 0 20px; }
.btn-activate { 
  background: #00c1b0; color: white; border: none; padding: 12px 24px; 
  border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; gap: 8px; align-items: center;
}

/* Selección de Monturas */
.selection-label { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }
.frame-card { 
  background: white; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; 
  margin-bottom: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: flex-start;
  transition: all 0.2s;
}
.frame-card--active { border-color: #00c1b0; box-shadow: 0 0 0 1px #00c1b0; }
.frame-name { display: block; font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 0.95rem; }
.frame-material { display: block; font-size: 0.75rem; color: #9ca3af; margin: 4px 0; }
.frame-price { font-family: 'Josefin Sans', sans-serif; font-weight: 700; color: #111827; }
.check-icon { color: #00c1b0; font-size: 1.1rem; }

/* Tips */
.tips-card { 
  margin-top: 24px; background: #f0f9ff; border-radius: 12px; padding: 20px; 
  display: flex; gap: 15px; border: 1px solid #e0f2fe;
}
.tips-icon { color: #3b82f6; font-size: 1.2rem; }
.tips-title { font-family: 'Montserrat', sans-serif; font-weight: 700; color: #1e40af; margin: 0 0 8px; font-size: 0.9rem; }
.tips-list { margin: 0; padding-left: 0; list-style: none; font-size: 0.85rem; color: #1e40af; line-height: 1.6; }


.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; margin: 0; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; margin: 4px 0 0; }
.btn-primary { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border: none; border-radius: 8px; background: #03070a; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:hover { opacity: 0.85; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-card { background: #fff; border-radius: 14px; padding: 18px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 6px; }
.stat-icon { font-size: 1.2rem; color: #6b7280; }
.stat-value { font-family: 'Josefin Sans', sans-serif; font-size: 1.7rem; font-weight: 700; color: #111827; }
.stat-label { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #6b7280; }

/* Toolbar */
.toolbar { background: #fff; border-radius: 12px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); padding: 12px 16px; display: flex; gap: 10px; align-items: center; }
.search-wrapper { flex: 1; position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.85rem; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 0.84rem; outline: none; color: #374151; box-sizing: border-box; }
.search-input:focus { border-color: #00c1b0; }
.btn-export { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.82rem; font-weight: 500; color: #374151; cursor: pointer; white-space: nowrap; }
.btn-export:hover { background: #f9fafb; }

/* Table */
.table-wrapper { background: #fff; border-radius: 14px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden; }
.table-header-row { display: grid; grid-template-columns: 1.4fr 1.4fr 0.8fr 1.3fr 0.9fr 0.9fr 0.8fr; gap: 12px; padding: 10px 20px; background: #f9fafb; border-bottom: 1px solid #f3f4f6; font-family: 'Montserrat', sans-serif; font-size: 0.7rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }
.table-row { display: grid; grid-template-columns: 1.4fr 1.4fr 0.8fr 1.3fr 0.9fr 0.9fr 0.8fr; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #f9fafb; align-items: center; transition: background 0.1s; cursor: default; }
.table-row:hover { background: #f9fafb; }
.table-row:last-child { border-bottom: none; }

.row-patient { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar { width: 34px; height: 34px; border-radius: 50%; background: rgba(0,193,176,0.15); color: #00c1b0; display: flex; align-items: center; justify-content: center; font-family: 'Josefin Sans', sans-serif; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
.patient-name { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; font-weight: 600; color: #111827; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.patient-num { font-family: 'Montserrat', sans-serif; font-size: 0.72rem; color: #9ca3af; }

.row-contact { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.contact-email, .contact-phone { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; display: flex; align-items: center; gap: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-email i, .contact-phone i { font-size: 0.7rem; flex-shrink: 0; }

.row-dni { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #374151; }

.row-rx { display: flex; flex-direction: column; gap: 2px; }
.rx-line { font-family: 'Montserrat', sans-serif; font-size: 0.74rem; color: #374151; display: flex; align-items: center; gap: 4px; }
.rx-icon { color: #00c1b0; font-size: 0.7rem; }
.rx-none { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #9ca3af; }

.row-date { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; }
.row-appt .appt-none { font-family: 'Montserrat', sans-serif; font-size: 0.78rem; color: #9ca3af; font-style: italic; }

.row-actions { display: flex; gap: 6px; }
.btn-hce { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: none; background: transparent; color: #00c1b0; font-family: 'Montserrat', sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer; border-radius: 6px; white-space: nowrap; }
.btn-hce:hover { background: rgba(0,193,176,0.08); }

.table-empty { padding: 56px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: #9ca3af; }
.empty-icon { font-size: 1.4rem; }
.empty-title { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #374151; margin: 0; }
.empty-desc { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #9ca3af; margin: 0; }

.table-footer { padding: 12px 20px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.table-footer span { font-family: 'Montserrat', sans-serif; font-size: 0.82rem; color: #6b7280; }
.pagination { display: flex; gap: 6px; }
.page-btn { padding: 5px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #374151; cursor: pointer; }
.page-btn:hover:not(:disabled) { background: #f9fafb; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn--active { background: #00c1b0; color: #fff; border-color: #00c1b0; } 


.search-box { display: flex; gap: 10px; }
.custom-input { 
  flex: 1; 
  padding: 10px; 
  border: 1px solid #f3f4f6; 
  border-radius: 8px; 
  font-family: 'Montserrat', sans-serif;
}
.btn-search {
  background: #00c1b0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
