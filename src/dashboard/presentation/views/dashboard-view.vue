<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t, tm, locale } = useI18n()

// Reactive date formatted in the active locale
const today = computed(() =>
  new Date().toLocaleDateString(
    locale.value === 'es' ? 'es-PE' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
)

// Stat card label keys — values are fixed, labels are translated
const stats = [
  { icon: 'pi-users',      iconBg: 'rgba(0,193,176,0.1)',   iconColor: '#00c1b0', value: '2,847',    labelKey: 'dashboard.stats.totalPatients',    trend: '+12%', up: true  },
  { icon: 'pi-calendar',   iconBg: 'rgba(147,193,206,0.2)', iconColor: '#93c1ce', value: '24',        labelKey: 'dashboard.stats.patientsToday',    trend: '+8%',  up: true  },
  { icon: 'pi-chart-line', iconBg: '#f0fdf4',               iconColor: '#22c55e', value: 'S/ 48,293', labelKey: 'dashboard.stats.monthlyRevenue',   trend: '+23%', up: true  },
  { icon: 'pi-wrench',     iconBg: '#fef2f2',               iconColor: '#e7000b', value: '15',        labelKey: 'dashboard.stats.pendingLabOrders', trend: '-5%',  up: false },
]

// Sample appointment data — statuses translated in template via `confirmed` flag
const appointments = [
  { time: '09:00 AM', name: 'Sarah Johnson',  service: 'Examen Visual · Dr. Smith',    confirmed: true  },
  { time: '10:30 AM', name: 'Michael Chen',   service: 'Adaptación de LC · Dr. Brown', confirmed: true  },
  { time: '02:00 PM', name: 'Emma Wilson',    service: 'Seguimiento · Dr. Smith',       confirmed: false },
  { time: '03:30 PM', name: 'David Martínez', service: 'Examen Visual · Dr. Lee',       confirmed: true  },
]

// Sample lab order data — stage translated via boolean flags that map to existing labOrders.* keys
const labOrders = [
  { name: 'Sarah Johnson',  order: 'LAB-2847 · Progresivos', urgent: true,  quality: false, received: false, delivery: '25 Abr' },
  { name: 'Michael Chen',   order: 'LAB-2846 · Contacto',    urgent: false, quality: true,  received: false, delivery: '22 Abr' },
  { name: 'David Martínez', order: 'LAB-2844 · Filtro Azul', urgent: false, quality: false, received: true,  delivery: '20 Abr' },
]

// Sample stock alert data — labels translated in template
const stockAlerts = [
  { name: 'Solución para LC',     remaining: 5,  min: 20, pct: 25 },
  { name: 'Lunas Filtro Azul',    remaining: 8,  min: 30, pct: 27 },
  { name: 'Armazones de Lectura', remaining: 12, min: 25, pct: 48 },
]

// ── Line chart geometry ──────────────────────────────────────────────────────
// Axis labels are reactive; geometry constants are locale-independent.
const recetasData = [65, 82, 108, 130, 200, 185]
const ventasData  = [35, 60,  75, 105, 155, 145]
const yTicks      = [0, 55, 110, 165, 220]

const LC = { left: 42, right: 740, top: 10, bottom: 185 }
const lcW = LC.right - LC.left
const lcH = LC.bottom - LC.top

function lx(i) { return LC.left + i * (lcW / 5) }
function ly(v) { return LC.bottom - (v / 220) * lcH }
function polyPts(data) {
  return data.map((v, i) => `${lx(i).toFixed(1)},${ly(v).toFixed(1)}`).join(' ')
}

const recPts     = polyPts(recetasData)
const venPts     = polyPts(ventasData)
const recAreaPts = `${recPts} ${LC.right},${LC.bottom} ${LC.left},${LC.bottom}`
const venAreaPts = `${venPts} ${LC.right},${LC.bottom} ${LC.left},${LC.bottom}`
const gridLines  = yTicks.map(v => ({ y: ly(v).toFixed(1), label: v }))
const recDots    = recetasData.map((v, i) => ({ cx: lx(i).toFixed(1), cy: ly(v).toFixed(1) }))
const venDots    = ventasData.map((v, i) => ({ cx: lx(i).toFixed(1), cy: ly(v).toFixed(1) }))

// X-axis labels react to locale changes via tm()
const months  = computed(() => tm('dashboard.charts.months'))
const xLabels = computed(() =>
  months.value.map((m, i) => ({ x: lx(i).toFixed(1), label: m }))
)

// ── Bar chart geometry ───────────────────────────────────────────────────────
const weekRevenue = [8200, 6100, 9800, 10500, 12000, 7200, 4500]
const BC          = { left: 40, bottom: 165, top: 10 }
const barChartW   = 310
const barSlot     = barChartW / 7
const barW        = Math.round(barSlot * 0.6)
const barMaxV     = 12000
const barHArea    = BC.bottom - BC.top

function bx(i) { return BC.left + i * barSlot + (barSlot - barW) / 2 }
function bh(v) { return (v / barMaxV) * barHArea }
function by(v) { return BC.bottom - bh(v) }

const barYTicks = [0, 3000, 6000, 9000, 12000].map(v => ({
  y: by(v).toFixed(1),
  label: v >= 1000 ? `${v / 1000}k` : '0',
}))

// Day labels react to locale changes via tm()
const weekDays = computed(() => tm('dashboard.charts.weekDays'))
const bars     = computed(() =>
  weekRevenue.map((v, i) => ({
    x: bx(i).toFixed(1), y: by(v).toFixed(1),
    h: bh(v).toFixed(1), w: barW,
    cx: (bx(i) + barW / 2).toFixed(1),
    label: weekDays.value[i],
  }))
)
</script>

<template>
  <div class="dashboard">

    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">{{ $t('dashboard.title') }}</h1>
        <p class="dash-subtitle">{{ $t('dashboard.subtitle') }} {{ today }}</p>
      </div>
      <div class="live-badge">
        <i class="pi pi-circle-fill live-dot" />
        <span>{{ $t('dashboard.liveIndicator') }}</span>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stat-grid">
      <div v-for="s in stats" :key="s.labelKey" class="stat-card">
        <div class="stat-card__top">
          <div class="stat-icon" :style="{ background: s.iconBg }">
            <i :class="['pi', s.icon]" :style="{ color: s.iconColor }" />
          </div>
          <div class="trend" :class="s.up ? 'trend--up' : 'trend--down'">
            <i :class="['pi', s.up ? 'pi-arrow-up-right' : 'pi-arrow-down-right']" class="trend-arrow" />
            {{ s.trend }}
          </div>
        </div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ $t(s.labelKey) }}</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">

      <!-- Line Chart: Conversión Receta → Venta -->
      <div class="card chart-main">
        <div class="card-header">
          <div>
            <h3 class="card-title">{{ $t('dashboard.charts.conversionTitle') }}</h3>
            <p class="card-subtitle">{{ $t('dashboard.charts.conversionSubtitle') }}</p>
          </div>
          <span class="period-badge">{{ $t('dashboard.charts.last6Months') }}</span>
        </div>
        <svg class="line-svg" viewBox="0 0 780 215" preserveAspectRatio="xMidYMid meet">
          <!-- Grid lines -->
          <line
            v-for="g in gridLines" :key="g.label"
            :x1="LC.left" :y1="g.y" :x2="LC.right" :y2="g.y"
            stroke="#f3f4f6" stroke-width="1"
          />
          <!-- Y-axis labels -->
          <text
            v-for="g in gridLines" :key="'y' + g.label"
            :x="LC.left - 6" :y="+g.y + 4"
            fill="#6b7280" font-size="11" text-anchor="end" font-family="Montserrat, sans-serif"
          >{{ g.label }}</text>
          <!-- X-axis labels (locale-reactive) -->
          <text
            v-for="xl in xLabels" :key="xl.label"
            :x="xl.x" :y="LC.bottom + 22"
            fill="#6b7280" font-size="11" text-anchor="middle" font-family="Montserrat, sans-serif"
          >{{ xl.label }}</text>
          <!-- Area fills -->
          <polygon :points="recAreaPts" fill="#6ee7b7" opacity="0.18" />
          <polygon :points="venAreaPts" fill="#00c1b0" opacity="0.12" />
          <!-- Lines -->
          <polyline :points="recPts" fill="none" stroke="#6ee7b7" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
          <polyline :points="venPts" fill="none" stroke="#00c1b0" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
          <!-- Dots — Recetas -->
          <circle
            v-for="(d, i) in recDots" :key="'rd' + i"
            :cx="d.cx" :cy="d.cy" r="4"
            fill="white" stroke="#6ee7b7" stroke-width="2"
          />
          <!-- Dots — Ventas -->
          <circle
            v-for="(d, i) in venDots" :key="'vd' + i"
            :cx="d.cx" :cy="d.cy" r="4"
            fill="white" stroke="#00c1b0" stroke-width="2"
          />
        </svg>
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-dot" style="background:#6ee7b7" />
            {{ $t('dashboard.charts.legendPrescriptions') }}
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background:#00c1b0" />
            {{ $t('dashboard.charts.legendSales') }}
          </span>
        </div>
      </div>

      <!-- Bar Chart: Ingresos Semanales -->
      <div class="card chart-side">
        <div class="card-header">
          <div>
            <h3 class="card-title">{{ $t('dashboard.charts.weeklyRevenueTitle') }}</h3>
            <p class="card-subtitle">{{ $t('dashboard.charts.weeklyRevenueSubtitle') }}</p>
          </div>
        </div>
        <svg class="bar-svg" viewBox="0 0 370 200" preserveAspectRatio="xMidYMid meet">
          <!-- Grid lines -->
          <line
            v-for="t in barYTicks" :key="'bg' + t.label"
            :x1="BC.left" :y1="t.y" x2="355" :y2="t.y"
            stroke="#f3f4f6" stroke-width="1"
          />
          <!-- Y-axis labels -->
          <text
            v-for="t in barYTicks" :key="'by' + t.label"
            :x="BC.left - 5" :y="+t.y + 4"
            fill="#6b7280" font-size="10" text-anchor="end" font-family="Montserrat, sans-serif"
          >{{ t.label }}</text>
          <!-- Bars -->
          <rect
            v-for="b in bars" :key="b.label"
            :x="b.x" :y="b.y" :width="b.w" :height="b.h"
            fill="#00c1b0" rx="4" opacity="0.85"
          />
          <!-- X-axis labels (locale-reactive) -->
          <text
            v-for="b in bars" :key="'bl' + b.label"
            :x="b.cx" :y="BC.bottom + 18"
            fill="#6b7280" font-size="10" text-anchor="middle" font-family="Montserrat, sans-serif"
          >{{ b.label }}</text>
        </svg>
      </div>

    </div>

    <!-- Bottom Row -->
    <div class="bottom-row">

      <!-- Appointments -->
      <div class="card">
        <div class="card-header card-header--border">
          <h3 class="card-title">{{ $t('dashboard.appointments.title') }}</h3>
          <span class="meta-text">{{ $t('dashboard.appointments.attended', { attended: 4, total: 24 }) }}</span>
        </div>
        <div class="appt-list">
          <div v-for="a in appointments" :key="a.name" class="appt-row">
            <div class="appt-info">
              <span class="appt-time">{{ a.time }}</span>
              <span class="appt-name">{{ a.name }}</span>
              <span class="appt-service">{{ a.service }}</span>
            </div>
            <span
              class="appt-status"
              :class="a.confirmed ? 'appt-status--confirmed' : 'appt-status--pending'"
            >
              {{ a.confirmed ? $t('dashboard.appointments.statusConfirmed') : $t('dashboard.appointments.statusPending') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Lab Orders -->
      <div class="card">
        <div class="card-header card-header--border">
          <h3 class="card-title">{{ $t('dashboard.labOrders.title') }}</h3>
        </div>
        <div class="lab-list">
          <div v-for="o in labOrders" :key="o.order" class="lab-row">
            <div class="lab-info">
              <span class="lab-name">{{ o.name }}</span>
              <span class="lab-order">{{ o.order }}</span>
            </div>
            <div class="lab-right">
              <span
                class="lab-stage"
                :class="{ 'stage--urgent': o.urgent, 'stage--quality': o.quality, 'stage--received': o.received }"
              >
                <template v-if="o.urgent">{{ $t('labOrders.priority.urgent') }}</template>
                <template v-else-if="o.quality">{{ $t('labOrders.status.QUALITY_CONTROL') }}</template>
                <template v-else>{{ $t('labOrders.status.PENDING') }}</template>
              </span>
              <span class="lab-delivery">
                {{ $t('dashboard.labOrders.deliveryLabel', { date: o.delivery }) }}
              </span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="link-btn" @click="router.push('/lab-orders')">
            {{ $t('labOrders.viewKanban') }} →
          </button>
        </div>
      </div>

      <!-- Stock Alerts -->
      <div class="card">
        <div class="card-header card-header--border">
          <h3 class="card-title">{{ $t('dashboard.stockAlerts.title') }}</h3>
          <span class="alert-badge">{{ $t('dashboard.stockAlerts.itemCount', { count: stockAlerts.length }) }}</span>
        </div>
        <div class="stock-list">
          <div v-for="s in stockAlerts" :key="s.name" class="stock-row">
            <div class="stock-top">
              <span class="stock-name">{{ s.name }}</span>
              <span class="stock-rem">{{ $t('dashboard.stockAlerts.remaining', { count: s.remaining }) }}</span>
            </div>
            <div class="stock-track">
              <div class="stock-fill" :style="{ width: s.pct + '%' }" />
            </div>
            <span class="stock-min">{{ $t('dashboard.stockAlerts.reorderMin', { min: s.min }) }}</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.dashboard {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dash-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #101828;
  margin: 0;
  letter-spacing: 0.24px;
}

.dash-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #6a7282;
  margin: 2px 0 0;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #6a7282;
}

.live-dot { color: #00c1b0; font-size: 9px; }

/* ── Stat Cards ─────────────────────────────────────────────────────────── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 1.5px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.1);
}

.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .pi { font-size: 18px; }

.trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.trend--up   { color: #96f6ee; }
.trend--down { color: #e7000b; }
.trend-arrow { font-size: 10px; }

.stat-value {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #101828;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #6a7282;
}

/* ── Shared Card ────────────────────────────────────────────────────────── */
.card {
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 14px;
  box-shadow: 0 1px 1.5px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 16px;
  gap: 12px;
}

.card-header--border { border-bottom: 1px solid #f3f4f6; }

.card-title {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #101828;
  margin: 0;
  letter-spacing: 0.18px;
}

.card-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #6a7282;
  margin: 2px 0 0;
}

.period-badge {
  background: rgba(0,193,176,0.08);
  color: #00c1b0;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

.meta-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #6a7282;
  flex-shrink: 0;
  margin-top: 4px;
}

.card-footer {
  border-top: 1px solid #f3f4f6;
  padding: 16px 20px;
  margin-top: auto;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #00c1b0;
  cursor: pointer;
}

.link-btn:hover { opacity: 0.75; }

/* ── Charts Row ─────────────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 390px;
  gap: 16px;
}

.chart-main { min-width: 0; }

.line-svg {
  width: 100%;
  height: 215px;
  display: block;
  padding: 0 8px;
  box-sizing: border-box;
}

.chart-legend {
  display: flex;
  gap: 20px;
  padding: 4px 20px 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #6a7282;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.bar-svg {
  width: 100%;
  height: 200px;
  display: block;
  padding: 0 8px;
  box-sizing: border-box;
  flex: 1;
}

/* ── Bottom Row ─────────────────────────────────────────────────────────── */
.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* ── Appointments ───────────────────────────────────────────────────────── */
.appt-list { display: flex; flex-direction: column; }

.appt-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f9fafb;
  gap: 8px;
}

.appt-row:last-child { border-bottom: none; }

.appt-info { display: flex; flex-direction: column; gap: 3px; }

.appt-time {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #00c1b0;
}

.appt-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #101828;
}

.appt-service {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #6a7282;
}

.appt-status {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

.appt-status--confirmed { background: #fef9c2; color: #008236; }
.appt-status--pending   { background: #a65f00; color: #ffe2e2; }

/* ── Lab Orders ─────────────────────────────────────────────────────────── */
.lab-list { display: flex; flex-direction: column; flex: 1; }

.lab-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f9fafb;
  gap: 8px;
}

.lab-row:last-child { border-bottom: none; }

.lab-info { display: flex; flex-direction: column; gap: 3px; }

.lab-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #101828;
}

.lab-order {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #6a7282;
}

.lab-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.lab-stage {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.stage--urgent   { background: #c10007; color: #f3e8ff; }
.stage--quality  { background: #8200db; color: #f3e8ff; }
.stage--received { background: #f3f4f6; color: #4a5565; }

.lab-delivery {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #99a1af;
}

/* ── Stock Alerts ───────────────────────────────────────────────────────── */
.alert-badge {
  background: #c10007;
  color: #f3e8ff;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  margin-top: 4px;
}

.stock-list { display: flex; flex-direction: column; }

.stock-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-bottom: 1px solid #f9fafb;
}

.stock-row:last-child { border-bottom: none; }

.stock-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stock-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #101828;
}

.stock-rem {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #e7000b;
}

.stock-track {
  width: 100%;
  height: 6px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: #ff8904;
  border-radius: 999px;
}

.stock-min {
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #99a1af;
}
</style>
