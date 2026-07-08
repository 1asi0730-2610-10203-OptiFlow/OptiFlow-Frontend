<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as faceapi from 'face-api.js'

import aviatorImg from '../../../assets/aviator_classic.jpg'
import wayfarerImg from '../../../assets/wayfarer_bold.jpg'
import roundImg from '../../../assets/round_vintage.jpg'
import catEyeImg from '../../../assets/cat_eye_modern.png'

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights'

const frames = ref([
  { id: 1, name: 'Aviator Classic',  material: 'Metal · Dorado',  price: '299', color: '#B8962E', image: aviatorImg },
  { id: 2, name: 'Wayfarer Bold',    material: 'Acetato · Negro', price: '349', color: '#1a1a1a', image: wayfarerImg },
  { id: 3, name: 'Round Vintage',    material: 'Metal · Miel',    price: '279', color: '#C68642', image: roundImg },
  { id: 4, name: 'Cat-Eye Modern',   material: 'Acetato · Rojo',  price: '329', color: '#dc2626', image: catEyeImg },
])

const selectedFrameId = ref(1)
const isCameraActive  = ref(false)
const modelsLoaded    = ref(false)
const modelsLoading   = ref(false)
const videoRef        = ref(null)
const canvasRef       = ref(null)
const streamRef       = ref(null)
let animationId       = null

function selectFrame(id) { selectedFrameId.value = id }

onMounted(async () => {
  modelsLoading.value = true
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ])
    modelsLoaded.value = true
  } catch {
    console.error('No se pudieron cargar los modelos de AR. Verifica tu conexión.')
  } finally {
    modelsLoading.value = false
  }
})

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    streamRef.value = stream
    isCameraActive.value = true
    await new Promise(resolve => setTimeout(resolve, 120))
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await new Promise(resolve => { videoRef.value.onloadedmetadata = resolve })
      videoRef.value.play()
    }
    runDetectionLoop()
  } catch {
    alert('No se pudo acceder a la cámara. Verifica los permisos.')
  }
}

function stopCamera() {
  if (animationId) { cancelAnimationFrame(animationId); animationId = null }
  if (streamRef.value) streamRef.value.getTracks().forEach(t => t.stop())
  isCameraActive.value = false
  streamRef.value = null
}

async function runDetectionLoop() {
  const video  = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas || !isCameraActive.value) return

  if (video.videoWidth && video.videoHeight) {
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks(true)

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (detection) {
    drawGlasses(ctx, detection.landmarks, selectedFrameId.value, canvas.width)
  }

  animationId = requestAnimationFrame(runDetectionLoop)
}

function drawGlasses(ctx, landmarks, frameId, canvasW) {
  const pts = landmarks.positions

  // Left eye landmarks 36-41, right eye 42-47
  const leftCx  = (pts[36].x + pts[37].x + pts[38].x + pts[39].x + pts[40].x + pts[41].x) / 6
  const leftCy  = (pts[36].y + pts[37].y + pts[38].y + pts[39].y + pts[40].y + pts[41].y) / 6
  const rightCx = (pts[42].x + pts[43].x + pts[44].x + pts[45].x + pts[46].x + pts[47].x) / 6
  const rightCy = (pts[42].y + pts[43].y + pts[44].y + pts[45].y + pts[46].y + pts[47].y) / 6

  const lw = Math.abs(pts[39].x - pts[36].x) * 0.80
  const rw = Math.abs(pts[45].x - pts[42].x) * 0.80
  const lh = lw * 0.60
  const lineW = Math.max(2, canvasW / 250)

  const frameColor = frames.value.find(f => f.id === frameId)?.color || '#333'

  ctx.save()
  ctx.strokeStyle = frameColor
  ctx.lineWidth   = lineW
  ctx.fillStyle   = 'rgba(180, 220, 255, 0.12)'

  if (frameId === 1) drawAviator(ctx, leftCx, leftCy, rightCx, rightCy, lw, rw, lh)
  if (frameId === 2) drawWayfarer(ctx, leftCx, leftCy, rightCx, rightCy, lw, rw, lh, lineW)
  if (frameId === 3) drawRound(ctx, leftCx, leftCy, rightCx, rightCy, lw, rw, lh)
  if (frameId === 4) drawCatEye(ctx, leftCx, leftCy, rightCx, rightCy, lw, rw, lh)

  // Nose bridge
  ctx.beginPath()
  ctx.moveTo(leftCx  + lw * 0.85, leftCy  + lh * 0.1)
  ctx.lineTo(rightCx - rw * 0.85, rightCy + lh * 0.1)
  ctx.stroke()

  // Temple arms
  ctx.beginPath()
  ctx.moveTo(leftCx  - lw, leftCy  - lh * 0.05)
  ctx.lineTo(leftCx  - lw * 2.4, leftCy  - lh * 0.25)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(rightCx + rw, rightCy - lh * 0.05)
  ctx.lineTo(rightCx + rw * 2.4, rightCy - lh * 0.25)
  ctx.stroke()

  ctx.restore()
}

function drawAviator(ctx, lx, ly, rx, ry, lw, rw, lh) {
  ctx.beginPath()
  ctx.ellipse(lx, ly + lh * 0.18, lw, lh * 1.05, 0, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(rx, ry + lh * 0.18, rw, lh * 1.05, 0, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
}

function drawWayfarer(ctx, lx, ly, rx, ry, lw, rw, lh, lineW) {
  const saved = ctx.lineWidth
  ctx.lineWidth = lineW * 2.2
  roundRect(ctx, lx - lw, ly - lh * 0.55, lw * 2, lh * 1.05, 5)
  ctx.fill(); ctx.stroke()
  roundRect(ctx, rx - rw, ry - lh * 0.55, rw * 2, lh * 1.05, 5)
  ctx.fill(); ctx.stroke()
  ctx.lineWidth = saved
}

function drawRound(ctx, lx, ly, rx, ry, lw, rw, lh) {
  const r = (lw + lh) / 2 * 0.88
  ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.arc(rx, ry, r, 0, Math.PI * 2)
  ctx.fill(); ctx.stroke()
}

function drawCatEye(ctx, lx, ly, rx, ry, lw, rw, lh) {
  // Left lens: tapers down on inner side, flares up on outer
  ctx.beginPath()
  ctx.moveTo(lx - lw, ly + lh * 0.25)
  ctx.bezierCurveTo(lx - lw * 1.15, ly - lh * 0.75, lx + lw * 0.15, ly - lh * 0.55, lx + lw, ly + lh * 0.25)
  ctx.bezierCurveTo(lx + lw * 0.6, ly + lh * 0.75, lx - lw * 0.6, ly + lh * 0.75, lx - lw, ly + lh * 0.25)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // Right lens: mirror of left
  ctx.beginPath()
  ctx.moveTo(rx - rw, ry + lh * 0.25)
  ctx.bezierCurveTo(rx - rw, ry + lh * 0.25, rx - rw * 0.15, ry - lh * 0.55, rx + rw * 1.15, ry - lh * 0.75)
  ctx.bezierCurveTo(rx + rw * 1.15, ry - lh * 0.75, rx + rw, ry + lh * 0.25, rx + rw, ry + lh * 0.25)
  ctx.bezierCurveTo(rx + rw * 0.6, ry + lh * 0.75, rx - rw * 0.6, ry + lh * 0.75, rx - rw, ry + lh * 0.25)
  ctx.closePath(); ctx.fill(); ctx.stroke()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

onBeforeUnmount(() => stopCamera())
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('patientCenter.virtualTryOn.title') }}</h1>
        <p class="page-subtitle">{{ $t('patientCenter.virtualTryOn.subtitle') }}</p>
      </div>
    </div>

    <div class="tryon-container">

      <!-- Camera + AR canvas -->
      <div class="card camera-section">
        <div class="card-header">
          <div class="camera-title-wrapper">
            <div class="avatar" style="background: rgba(0,193,176,0.1);"><i class="pi pi-eye" /></div>
            <div>
              <h3 class="card-title">{{ $t('patientCenter.virtualTryOn.cardTitle') }}</h3>
              <p class="card-subtitle">{{ $t('patientCenter.virtualTryOn.cardSubtitle') }}</p>
            </div>
          </div>
          <button v-if="isCameraActive" class="btn-activate btn-stop" @click="stopCamera">
            <i class="pi pi-times" /> {{ $t('patientCenter.virtualTryOn.turnOffBtn') }}
          </button>
        </div>

        <div class="camera-placeholder" :class="{ 'has-camera': isCameraActive }">
          <template v-if="!isCameraActive">
            <i class="pi pi-camera camera-large-icon" />
            <h2 class="activate-text">{{ $t('patientCenter.virtualTryOn.activateCamera') }}</h2>
            <p class="activate-subtext">{{ $t('patientCenter.virtualTryOn.cameraInstruction') }}</p>

            <div v-if="modelsLoading" class="models-status">
              <i class="pi pi-spin pi-spinner" />
              <span>Cargando modelos AR…</span>
            </div>
            <div v-else-if="modelsLoaded" class="models-status models-status--ready">
              <i class="pi pi-check-circle" />
              <span>AR listo</span>
            </div>

            <button class="btn-activate" :disabled="!modelsLoaded" @click="startCamera">
              <i class="pi pi-camera" /> {{ $t('patientCenter.virtualTryOn.turnOnBtn') }}
            </button>
          </template>

          <template v-else>
            <video ref="videoRef" autoplay playsinline muted class="video-stream" />
            <canvas ref="canvasRef" class="ar-canvas" />
          </template>
        </div>
      </div>

      <!-- Frame selector -->
      <div class="frames-selection">
        <p class="selection-label">{{ $t('patientCenter.virtualTryOn.selectFrame') }}</p>
        <div
          v-for="frame in frames"
          :key="frame.id"
          class="frame-card"
          :class="{ 'frame-card--active': selectedFrameId === frame.id }"
          @click="selectFrame(frame.id)"
        >
          <img :src="frame.image" :alt="frame.name" class="frame-preview" />
          <div class="frame-info">
            <span class="frame-name">{{ frame.name }}</span>
            <span class="frame-material">{{ frame.material }}</span>
            <span class="frame-price">S/ {{ frame.price }}</span>
          </div>
          <i v-if="selectedFrameId === frame.id" class="pi pi-check-circle check-icon" />
        </div>
</div>

    </div>

    <div class="tips-card">
      <i class="pi pi-info-circle tips-icon" />
      <div>
        <p class="tips-title">{{ $t('patientCenter.virtualTryOn.tipsTitle') }}</p>
        <ul class="tips-list">
          <li v-for="(tip, idx) in $tm('patientCenter.virtualTryOn.tips')" :key="idx">{{ tip }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Josefin Sans', sans-serif; font-size: 1.5rem; font-weight: 700; color: #03070a; margin: 0; }
.page-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.84rem; color: #6b7280; margin: 4px 0 0; }

.tryon-container { display: grid; grid-template-columns: 1.2fr 380px; gap: 24px; }

.card { background: #fff; border-radius: 14px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }

.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
.camera-title-wrapper { display: flex; align-items: center; gap: 12px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; color: #00c1b0; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
.card-title { font-family: 'Josefin Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0; }
.card-subtitle { font-family: 'Montserrat', sans-serif; font-size: 0.76rem; color: #6b7280; margin: 2px 0 0; }

.camera-placeholder {
  background: #111827; margin: 20px; border-radius: 12px; height: 370px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: white; text-align: center; padding: 20px; overflow: hidden;
  position: relative;
}
.camera-placeholder.has-camera { padding: 0; background: #000; }

.video-stream {
  width: 100%; height: 100%; object-fit: cover;
  transform: scaleX(-1);
  display: block;
}

.ar-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  transform: scaleX(-1);
  pointer-events: none;
}

.camera-large-icon { font-size: 3rem; opacity: 0.5; margin-bottom: 15px; }
.activate-text { font-family: 'Josefin Sans', sans-serif; margin: 0; }
.activate-subtext { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; opacity: 0.7; max-width: 250px; margin: 10px 0 16px; }

.models-status {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Montserrat', sans-serif; font-size: 0.78rem;
  background: rgba(255,255,255,0.1); border-radius: 20px;
  padding: 4px 12px; margin-bottom: 12px; opacity: 0.9;
}
.models-status--ready { color: #6ee7b7; }

.btn-activate {
  background: #00c1b0; color: white; border: none; padding: 12px 24px;
  border-radius: 8px; font-family: 'Montserrat', sans-serif; font-weight: 600;
  cursor: pointer; display: flex; gap: 8px; align-items: center; transition: opacity 0.15s;
}
.btn-activate:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-activate:not(:disabled):hover { opacity: 0.88; }
.btn-stop { background: #ef4444; padding: 8px 16px; font-size: 0.85rem; }

.frames-selection { display: flex; flex-direction: column; }
.selection-label { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }

.frame-card {
  background: white; border: 1px solid #f3f4f6; border-radius: 12px; padding: 14px 16px;
  margin-bottom: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;
  transition: all 0.2s;
}
.frame-card--active { border-color: #00c1b0; box-shadow: 0 0 0 1px #00c1b0; }
.frame-preview {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  border: 1px solid #f3f4f6;
}
.frame-info { flex: 1; }
.frame-name { display: block; font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 0.9rem; }
.frame-material { display: block; font-size: 0.72rem; color: #9ca3af; margin: 2px 0; }
.frame-price { font-family: 'Josefin Sans', sans-serif; font-weight: 700; color: #111827; font-size: 0.88rem; }
.check-icon { color: #00c1b0; font-size: 1.1rem; }

.tips-card {
  background: #f0f9ff; border-radius: 12px; padding: 20px;
  display: flex; gap: 15px; border: 1px solid #e0f2fe;
}
.tips-icon { color: #3b82f6; font-size: 1.2rem; }
.tips-title { font-family: 'Montserrat', sans-serif; font-weight: 700; color: #1e40af; margin: 0 0 8px; font-size: 0.9rem; }
.tips-list { margin: 0; padding-left: 0; list-style: none; font-size: 0.85rem; color: #1e40af; line-height: 1.6; }
</style>
