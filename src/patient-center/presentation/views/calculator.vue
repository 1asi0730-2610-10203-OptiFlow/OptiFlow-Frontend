<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCalculatorStore } from '../../application/calculator.store.js'
import { useI18n } from 'vue-i18n'

const store = useCalculatorStore()
const { t } = useI18n()

const esfera = ref('')
const cilindro = ref('')
const selectedMaterialId = ref(1)
const showResults = ref(false)
const errors = ref({})
const submitted = ref(false)

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

function handleCalculate() {
  submitted.value = true
  const e = {}
  if (!esfera.value) e.esfera = true
  if (!cilindro.value) e.cilindro = true
  errors.value = e
  
  if (Object.keys(e).length === 0) {
    showResults.value = true
  } else {
    showResults.value = false
  }
}

const backupMaterials = [
  { id: 1, name: 'Estándar (CR-39)', info: 'Índice 1.5', price: '120' },
  { id: 2, name: 'Delgado (Hi-Index 1.60)', info: 'Índice 1.6', price: '280' },
  { id: 3, name: 'Extra Delgado (Hi-Index 1.67)', info: 'Índice 1.67', price: '420' },
  { id: 4, name: 'Ultra Delgado (Hi-Index 1.74)', info: 'Índice 1.74', price: '650' },
]


const displayMaterials = computed(() => {
  return store.materials.length > 0 ? store.materials : backupMaterials
})

onMounted(async () => {
    try {
      await store.loadMaterials()
    } catch (e) {
      console.log("Usando datos locales de respaldo")
    }
})

function selectMaterial(id) {
  selectedMaterialId.value = id
}


const results = computed(() => {
  const p = Math.abs(parseFloat(esfera.value || 0)) + Math.abs(parseFloat(cilindro.value || 0))
  return displayMaterials.value.map(m => {
    const indexNum = parseFloat(m.info.replace(/[^\d.]/g, '')) || 1.5
    const thickness = (p * (1.85 / indexNum)).toFixed(1)
    return { ...m, thickness }
  })
})

const currentResult = computed(() => 
  results.value.find(r => r.id === selectedMaterialId.value) || results.value[0]
)

const infoIndices = [
  { title: 'Índice 1.50 (Estándar)', text: 'Material básico, ideal para graduaciones bajas (-2.00 a +2.00)' },
  { title: 'Índice 1.60 (Delgado)', text: '30% más delgado, recomendado para graduaciones medias' },
  { title: 'Índice 1.67 (Extra Delgado)', text: '40% más delgado, ideal para graduaciones altas' },
  { title: 'Índice 1.74 (Ultra Delgado)', text: 'Máxima reducción de grosor para graduaciones muy altas' }
]
</script>



<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('patientCenter.calculator.title') }}</h1>
        <p class="page-subtitle">{{ $t('patientCenter.calculator.subtitle') }}</p>
      </div>
    </div>

    <!-- Contenedor principal en Grid -->
    <div class="calculator-grid">
      
      <!-- LADO IZQUIERDO: Formulario -->
      <div class="card calculator-container">
        <div class="card-header">
          <div class="header-with-icon">
            <div class="avatar" style="background: rgba(0,193,176,0.1); color: #00c1b0;">
              <i class="pi pi-calculator" />
            </div>
            <div>
              <h3 class="card-title">{{ $t('patientCenter.calculator.cardTitle') }}</h3>
              <p class="card-subtitle">{{ $t('patientCenter.calculator.cardSubtitle') }}</p>
            </div>
          </div>
        </div>

        <div class="card-body">
          <div class="form-section">
            <div class="field">
              <label>{{ $t('patientCenter.calculator.sphere') }} <span class="required" style="color: #ef4444;">*</span></label>
              <input v-model="esfera" type="text" class="form-input" :class="{ 'form-input--error': errors.esfera }" @input="errors.esfera = false" placeholder="-2.50">
            </div>
            <div class="field">
              <label>{{ $t('patientCenter.calculator.cylinder') }} <span class="required" style="color: #ef4444;">*</span></label>
              <input v-model="cilindro" type="text" class="form-input" :class="{ 'form-input--error': errors.cilindro }" @input="errors.cilindro = false" placeholder="-0.75">
            </div>
          </div>

          <div class="material-section">
            <label class="section-label">{{ $t('patientCenter.calculator.materials') }}</label>
            
            <p v-if="store.loading" style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 10px;">
              <i class="pi pi-spin pi-spinner"></i> {{ $t('patientCenter.calculator.loading') }}
            </p>

            <div 
              v-for="mat in displayMaterials" 
              :key="mat.id" 
              class="material-option"
              :class="{ 'material-option--active': selectedMaterialId === mat.id }"
              @click="selectMaterial(mat.id)"
            >
              <div class="mat-info">
                <span class="mat-name">{{ mat.name }}</span>
                <span class="mat-desc">{{ mat.info }}</span>
              </div>
              <span class="mat-price">S/ {{ mat.price }}</span>
            </div>
          </div>

          <button class="btn-calculate" @click="handleCalculate">
            {{ $t('patientCenter.calculator.calculateBtn') }}
          </button>
          
          <p v-if="submitted && hasErrors" style="color: #dc2626; font-size: 0.8rem; font-family: Montserrat; margin: 10px 0 0; text-align: center;">
            {{ $t('common.requiredError') }}
          </p>
        </div>
      </div>

      <!-- LADO DERECHO: Resultados -->
      <div v-if="showResults" class="results-panel">
        <div class="card result-main-card">
          <p class="result-label">{{ $t('patientCenter.calculator.thickness') }}</p>
          <h2 class="result-value">{{ currentResult.thickness }} mm</h2>
          <p class="result-sub">{{ $t('patientCenter.calculator.with') }} {{ currentResult.name }}</p>
        </div>

        <div class="card comparison-card">
          <div class="card-header">
            <h3 class="card-title">{{ $t('patientCenter.calculator.comparison') }}</h3>
          </div>
          <div class="card-body" style="padding-top: 0;">
            <div v-for="res in results" :key="res.id" class="comp-row">
              <div class="comp-info">
                <span>{{ res.name }}</span>
                <span>{{ res.thickness }} mm</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (res.thickness * 10) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="recommendation-box">
          <i class="pi pi-info-circle"></i>
          <div>
            <strong>{{ $t('patientCenter.calculator.recommendationTitle') }}</strong>
            <p>{{ $t('patientCenter.calculator.recommendationDesc') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Guía Inferior -->
    <div class="info-guide">
      <p class="guide-title">{{ $t('patientCenter.calculator.guideTitle') }}</p>
      <div class="guide-grid">
        <div class="guide-item">
          <strong>{{ $t('patientCenter.calculator.guides.std.title') }}</strong>
          <p>{{ $t('patientCenter.calculator.guides.std.text') }}</p>
        </div>
        <div class="guide-item">
          <strong>{{ $t('patientCenter.calculator.guides.thin.title') }}</strong>
          <p>{{ $t('patientCenter.calculator.guides.thin.text') }}</p>
        </div>
        <div class="guide-item">
          <strong>{{ $t('patientCenter.calculator.guides.extraThin.title') }}</strong>
          <p>{{ $t('patientCenter.calculator.guides.extraThin.text') }}</p>
        </div>
        <div class="guide-item">
          <strong>{{ $t('patientCenter.calculator.guides.ultraThin.title') }}</strong>
          <p>{{ $t('patientCenter.calculator.guides.ultraThin.text') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Contenedor Principal en Grid */
.calculator-grid { 
  display: grid; 
  grid-template-columns: 1fr 400px; /* La columna derecha es un poco más estrecha */
  gap: 24px; 
  align-items: start; 
  margin-top: 20px;
}

.calculator-container { width: 100%; }
.card-body { padding: 24px; }
.header-with-icon { display: flex; align-items: center; gap: 12px; }

/* Formulario */
.form-section { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; color: #374151; }
.form-input { 
  padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; 
  font-family: 'Montserrat', sans-serif; font-size: 0.9rem; outline: none;
}
.form-input:focus { border-color: #00c1b0; }
.form-input--error { border-color: #f87171 !important; background-color: #fff5f5 !important; }

/* Opciones de Material */
.section-label { display: block; font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }
.material-option {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border: 1px solid #f3f4f6; border-radius: 10px;
  margin-bottom: 10px; cursor: pointer; transition: all 0.2s;
}
.material-option--active { border-color: #00c1b0; background: rgba(0,193,176,0.02); }
.mat-name { display: block; font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 0.9rem; }
.mat-desc { font-size: 0.75rem; color: #9ca3af; }
.mat-price { font-family: 'Josefin Sans', sans-serif; font-weight: 700; color: #111827; }

/* Botón Calcular */
.btn-calculate {
  width: 100%; padding: 14px; background: #85e3d9; color: white; border: none;
  border-radius: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;
  cursor: pointer; margin-top: 10px; transition: background 0.2s;
}
.btn-calculate:hover { background: #00c1b0; }
.btn-calculate:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── PANEL DE RESULTADOS (Derecha) ── */
.results-panel { display: flex; flex-direction: column; gap: 16px; }

.result-main-card { 
  background: #111827; color: white; padding: 32px 24px; 
  text-align: center; border-radius: 14px; border: none;
}
.result-label { font-family: 'Montserrat'; font-size: 0.8rem; opacity: 0.7; margin: 0; }
.result-value { font-size: 2.8rem; font-family: 'Josefin Sans'; font-weight: 700; margin: 8px 0; color: white; }
.result-sub { font-family: 'Montserrat'; font-size: 0.85rem; opacity: 0.8; margin: 0; }

.comp-row { margin-top: 15px; }
.comp-info { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px; font-family: 'Montserrat'; }
.progress-bar { background: #f3f4f6; height: 8px; border-radius: 4px; overflow: hidden; }
.progress-fill { background: #00c1b0; height: 100%; transition: width 0.5s ease-out; }

.recommendation-box { 
  background: #f0f9ff; padding: 16px; border-radius: 12px; 
  display: flex; gap: 12px; color: #0369a1; border: 1px solid #e0f2fe;
}
.recommendation-box i { margin-top: 3px; }
.recommendation-box p { margin: 0; font-size: 0.82rem; line-height: 1.4; font-family: 'Montserrat'; }

/* Guía inferior */
.info-guide { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6; }
.guide-title { font-family: 'Josefin Sans', sans-serif; font-weight: 700; margin-bottom: 16px; }
.guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.guide-item strong { display: block; font-size: 0.85rem; color: #374151; margin-bottom: 4px; }
.guide-item p { font-size: 0.8rem; color: #6b7280; margin: 0; line-height: 1.4; }
</style>
