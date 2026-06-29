<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '../../application/dashboard.store.js'

const router = useRouter()
const { t, tm, locale } = useI18n()
const store = useDashboardStore()

onMounted(() => store.fetchAll())

// Reactive date formatted in the active locale
const today = computed(() =>
    new Date().toLocaleDateString(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        { day: 'numeric', month: 'long', year: 'numeric' }
    )
)

// ── Stat Cards (live data) ────────────────────────────────────────────────
const stats = computed(() => [
  {
    icon: 'pi-users',
    iconBg: 'rgba(0,193,176,0.1)', iconColor: '#00c1b0',
    value: store.totalPatients,
    labelKey: 'dashboard.stats.totalPatients',
  },
  {
    icon: 'pi-calendar',
    iconBg: 'rgba(147,193,206,0.2)', iconColor: '#93c1ce',
    value: store.salesToday,
    labelKey: 'dashboard.stats.patientsToday',
  },
  {
    icon: 'pi-chart-line',
    iconBg: '#f0fdf4', iconColor: '#22c55e',
    value: store.monthlyRevenue > 0
        ? `S/ ${store.monthlyRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
        : 'S/ 0.00',
    labelKey: 'dashboard.stats.monthlyRevenue',
  },
  {
    icon: 'pi-wrench',
    iconBg: '#fef2f2', iconColor: '#e7000b',
    value: store.pendingLabOrders,
    labelKey: 'dashboard.stats.pendingLabOrders',
  },
])

// ── Lab Orders Section ─────────────────────────────────────────────────────
function parseLocalDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

const labOrders = computed(() =>
    store.recentWorkOrders.map(o => ({
      patientName: o.patientName ?? '—',
      lensType:    o.lensType    || null,
      status:      o.status      ?? 'PENDING',
      urgent:      (o.priority   ?? '').toLowerCase() === 'urgent',
      isRework:    !!o.isRework,
      delivery:    (() => {
        const d = parseLocalDate(o.deliveryDate)
        return d ? d.toLocaleDateString(
            locale.value === 'es' ? 'es-PE' : 'en-US',
            { day: 'numeric', month: 'short' }
        ) : '—'
      })(),
    }))
)

function labOrderStatusClass(o) {
  if (o.urgent) return 'urgent'
  switch (o.status) {
    case 'IN_PRODUCTION':   return 'in-production'
    case 'QUALITY_CONTROL': return 'quality'
    case 'READY':           return 'ready'
    case 'DELIVERED':       return 'delivered'
    default:                return 'pending'
  }
}

function labOrderStatusKey(o) {
  if (o.urgent) return 'labOrders.priority.urgent'
  switch (o.status) {
    case 'IN_PRODUCTION':   return 'labOrders.status.IN_PRODUCTION'
    case 'QUALITY_CONTROL': return 'labOrders.status.QUALITY_CONTROL'
    case 'READY':           return 'labOrders.status.READY'
    case 'DELIVERED':       return 'labOrders.status.DELIVERED'
    default:                return 'labOrders.status.PENDING'
  }
}

// ── Stock Alerts Section ───────────────────────────────────────────────────
const stockAlerts = computed(() => store.stockAlerts)

// ── Line Chart: detectar si hay datos reales ──────────────────────────────
const hasChartData = computed(() =>
    store.recetasChartData.length > 0 &&
    store.recetasChartData.some(v => v > 0)
)

const recetasData = computed(() =>
    store.recetasChartData.length ? store.recetasChartData : [0]
)
const ventasData = computed(() =>
    store.ventasChartData.length ? store.ventasChartData : [0]
)

const chartMax = computed(() => {
  const all = [...recetasData.value, ...ventasData.value]
  const max = Math.max(...all)
  return max > 0 ? Math.ceil(max / 4) * 4 : 4
})

const yTicks = computed(() => {
  const m = chartMax.value
  return [0, Math.round(m * 0.25), Math.round(m * 0.5), Math.round(m * 0.75), m]
})

const LC = { left: 42, right: 740, top: 10, bottom: 185 }
const lcW = LC.right - LC.left
const lcH = LC.bottom - LC.top

function lx(i, total) {
  return total <= 1 ? LC.left + lcW / 2 : LC.left + i * (lcW / (total - 1))
}
function ly(v, max) {
  return max === 0 ? LC.bottom : LC.bottom - (v / max) * lcH
}

const recPts = computed(() => {
  const data = recetasData.value
  const max  = chartMax.value
  return data.map((v, i) => `${lx(i, data.length).toFixed(1)},${ly(v, max).toFixed(1)}`).join(' ')
})
const venPts = computed(() => {
  const data = ventasData.value
  const max  = chartMax.value
  return data.map((v, i) => `${lx(i, data.length).toFixed(1)},${ly(v, max).toFixed(1)}`).join(' ')
})
const recAreaPts = computed(() => `${recPts.value} ${LC.right},${LC.bottom} ${LC.left},${LC.bottom}`)
const venAreaPts = computed(() => `${venPts.value} ${LC.right},${LC.bottom} ${LC.left},${LC.bottom}`)

const gridLines = computed(() =>
    yTicks.value.map(v => ({ y: ly(v, chartMax.value).toFixed(1), label: v }))
)
const recDots = computed(() => {
  const data = recetasData.value
  const max  = chartMax.value
  return data.map((v, i) => ({ cx: lx(i, data.length).toFixed(1), cy: ly(v, max).toFixed(1) }))
})
const venDots = computed(() => {
  const data = ventasData.value
  const max  = chartMax.value
  return data.map((v, i) => ({ cx: lx(i, data.length).toFixed(1), cy: ly(v, max).toFixed(1) }))
})

// X-axis labels: use period labels from API or fall back to i18n month names
const months  = computed(() => tm('dashboard.charts.months'))
const xLabels = computed(() => {
  const periods = store.chartPeriodLabels
  const data    = recetasData.value
  if (periods.length) {
    return periods.map((p, i) => ({
      x:     lx(i, periods.length).toFixed(1),
      label: new Date(p + '-01').toLocaleDateString(
          locale.value === 'es' ? 'es-PE' : 'en-US',
          { month: 'short' }
      ),
    }))
  }
  return months.value.map((m, i) => ({ x: lx(i, data.length).toFixed(1), label: m }))
})

// ── Bar Chart: detectar si hay datos reales ───────────────────────────────
const hasBarData = computed(() =>
    store.weekRevenueData.length > 0 &&
    store.weekRevenueData.some(v => v > 0)
)

// ── Bar Chart Geometry ───────────────────────────────────────────────────
const weekRevenue = computed(() =>
    store.weekRevenueData.length ? store.weekRevenueData : [0]
)

const BC        = { left: 40, bottom: 165, top: 10 }
const barChartW = 310
const barMaxV   = computed(() => {
  const m = Math.max(...weekRevenue.value)
  return m > 0 ? m : 1
})
const barHArea = BC.bottom - BC.top

function bSlot(total) { return barChartW / Math.max(total, 1) }
function bx(i, total) {
  const slot = bSlot(total)
  const w    = Math.round(slot * 0.6)
  return BC.left + i * slot + (slot - w) / 2
}
function bw(total)   { return Math.round(bSlot(total) * 0.6) }
function bh(v, maxV) { return (v / maxV) * barHArea }
function by(v, maxV) { return BC.bottom - bh(v, maxV) }

const barYTicks = computed(() => {
  const m = barMaxV.value
  return [0, Math.round(m * 0.25), Math.round(m * 0.5), Math.round(m * 0.75), m].map(v => ({
    y:     by(v, m).toFixed(1),
    label: v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v),
  }))
})

const barLabels = computed(() => {
  const periods = store.chartPeriodLabels
  if (periods.length) {
    return periods.map(p =>
        new Date(p + '-01').toLocaleDateString(
            locale.value === 'es' ? 'es-PE' : 'en-US',
            { month: 'short' }
        )
    )
  }
  return tm('dashboard.charts.weekDays')
})

const bars = computed(() => {
  const rev   = weekRevenue.value
  const maxV  = barMaxV.value
  const total = rev.length
  return rev.map((v, i) => ({
    x:     bx(i, total).toFixed(1),
    y:     by(v, maxV).toFixed(1),
    h:     bh(v, maxV).toFixed(1),
    w:     bw(total),
    cx:    (bx(i, total) + bw(total) / 2).toFixed(1),
    label: barLabels.value[i] ?? '',
  }))
})
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

    <!-- Loading bar -->
    <div v-if="store.loading" class="loading-bar" />

    <!-- Stat Cards -->
    <div class="stat-grid">
      <div v-for="s in stats" :key="s.labelKey" class="stat-card">
        <div class="stat-card__top">
          <div class="stat-icon" :style="{ background: s.iconBg }">
            <i :class="['pi', s.icon]" :style="{ color: s.iconColor }" />
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

        <!-- Empty state: sin datos -->
        <div v-if="!store.loading && !hasChartData" class="chart-empty-state">
          <i class="pi pi-calendar chart-empty-icon" />
          <span class="chart-empty-text">{{ $t('dashboard.stats.NoResults') }}</span>
        </div>

        <!-- Gráfico: solo cuando hay datos -->
        <template v-else-if="hasChartData">
          <svg class="line-svg" viewBox="0 0 780 215" preserveAspectRatio="xMidYMid meet">
            <line
                v-for="g in gridLines" :key="g.label"
                :x1="LC.left" :y1="g.y" :x2="LC.right" :y2="g.y"
                stroke="#f3f4f6" stroke-width="1"
            />
            <text
                v-for="g in gridLines" :key="'y' + g.label"
                :x="LC.left - 6" :y="+g.y + 4"
                fill="#6b7280" font-size="11" text-anchor="end" font-family="Montserrat, sans-serif"
            >{{ g.label }}</text>
            <text
                v-for="xl in xLabels" :key="xl.label"
                :x="xl.x" :y="LC.bottom + 22"
                fill="#6b7280" font-size="11" text-anchor="middle" font-family="Montserrat, sans-serif"
            >{{ xl.label }}</text>
            <polygon :points="recAreaPts" fill="#6ee7b7" opacity="0.18" />
            <polygon :points="venAreaPts" fill="#00c1b0" opacity="0.12" />
            <polyline :points="recPts" fill="none" stroke="#6ee7b7" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            <polyline :points="venPts" fill="none" stroke="#00c1b0" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            <circle
                v-for="(d, i) in recDots" :key="'rd' + i"
                :cx="d.cx" :cy="d.cy" r="4"
                fill="white" stroke="#6ee7b7" stroke-width="2"
            />
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
        </template>

        <!-- Skeleton mientras carga -->
        <div v-else class="chart-empty-state">
          <i class="pi pi-spin pi-spinner chart-empty-icon" style="opacity:0.3" />
        </div>
      </div>

      <!-- Bar Chart: Ingresos por Periodo -->
      <div class="card chart-side">
        <div class="card-header">
          <div>
            <h3 class="card-title">{{ $t('dashboard.charts.weeklyRevenueTitle') }}</h3>
            <p class="card-subtitle">{{ $t('dashboard.charts.weeklyRevenueSubtitle') }}</p>
          </div>
        </div>

        <!-- Empty state: sin ingresos -->
        <div v-if="!store.loading && !hasBarData" class="chart-empty-state">
          <i class="pi pi-chart-bar chart-empty-icon" />
          <span class="chart-empty-text">{{ $t('dashboard.charts.NoResults') }}</span>
        </div>

        <!-- Gráfico: solo cuando hay datos -->
        <svg v-else-if="hasBarData" class="bar-svg" viewBox="0 0 370 200" preserveAspectRatio="xMidYMid meet">
          <line
              v-for="t in barYTicks" :key="'bg' + t.label"
              :x1="BC.left" :y1="t.y" x2="355" :y2="t.y"
              stroke="#f3f4f6" stroke-width="1"
          />
          <text
              v-for="t in barYTicks" :key="'by' + t.label"
              :x="BC.left - 5" :y="+t.y + 4"
              fill="#6b7280" font-size="10" text-anchor="end" font-family="Montserrat, sans-serif"
          >{{ t.label }}</text>
          <rect
              v-for="b in bars" :key="b.label"
              :x="b.x" :y="b.y" :width="b.w" :height="b.h"
              fill="#00c1b0" rx="4" opacity="0.85"
          />
          <text
              v-for="b in bars" :key="'bl' + b.label"
              :x="b.cx" :y="BC.bottom + 18"
              fill="#6b7280" font-size="10" text-anchor="middle" font-family="Montserrat, sans-serif"
          >{{ b.label }}</text>
        </svg>

        <!-- Skeleton mientras carga -->
        <div v-else class="chart-empty-state">
          <i class="pi pi-spin pi-spinner chart-empty-icon" style="opacity:0.3" />
        </div>
      </div>

    </div>

    <!-- Bottom Row -->
    <div class="bottom-row">

      <!-- Appointments placeholder -->
      <div class="card">
        <div class="card-header card-header--border">
          <h3 class="card-title">{{ $t('dashboard.appointments.title') }}</h3>
          <span class="meta-text">{{ $t('dashboard.appointments.attended', { attended: 0, total: 0 }) }}</span>
        </div>
        <div class="section-empty-state">
          <div class="section-empty-icon-wrap section-empty-icon-wrap--blue">
            <i class="pi pi-users section-empty-icon" />
          </div>
          <span class="section-empty-text">{{ $t('dashboard.appointments.statusPending') }}</span>
        </div>
      </div>

      <!-- Lab Orders -->
      <div class="card">
        <div class="card-header card-header--border">
          <h3 class="card-title">{{ $t('dashboard.labOrders.title') }}</h3>
          <span class="period-badge">{{ labOrders.length }}</span>
        </div>
        <div class="lab-cards-wrap">
          <div v-if="labOrders.length" class="lab-cards">
            <div
                v-for="o in labOrders"
                :key="o.patientName + o.status"
                class="lab-mini-card"
                :class="`lab-mini-card--${labOrderStatusClass(o)}`"
            >
              <div class="lab-mini-card__top">
                <span class="lab-mini-badge" :class="`lab-badge--${labOrderStatusClass(o)}`">
                  {{ $t(labOrderStatusKey(o)) }}
                </span>
                <span v-if="o.isRework" class="lab-mini-rework">
                  <i class="pi pi-refresh" /> {{ $t('labOrders.card.rework') }}
                </span>
              </div>
              <div class="lab-mini-patient">{{ o.patientName }}</div>
              <div v-if="o.lensType" class="lab-mini-lens">
                <i class="pi pi-eye" />
                {{ o.lensType }}
              </div>
              <div class="lab-mini-footer">
                <i class="pi pi-calendar" />
                {{ o.delivery }}
              </div>
            </div>
          </div>
          <div v-else class="section-empty-state">
            <div class="section-empty-icon-wrap section-empty-icon-wrap--teal">
              <i class="pi pi-truck section-empty-icon" />
            </div>
            <span class="section-empty-text">{{ $t('dashboard.labOrders.NoResults') }}</span>
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
          <template v-if="stockAlerts.length">
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
          </template>
          <div v-else class="section-empty-state">
            <div class="section-empty-icon-wrap section-empty-icon-wrap--green">
              <i class="pi pi-check-circle section-empty-icon" />
            </div>
            <span class="section-empty-text">{{ $t('dashboard.stockAlerts.NoResults') }}</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.dashboard {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-bar {
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #00c1b0 0%, #6ee7b7 50%, #00c1b0 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Chart empty state ───────────────────────────────────────────────────── */
.chart-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 215px;
  color: #9ca3af;
}

.chart-empty-icon {
  font-size: 40px;
  opacity: 0.35;
  color: #00c1b0;
}

.chart-empty-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #9ca3af;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: #9ca3af;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  flex: 1;
}

.empty-icon { font-size: 28px; opacity: 0.4; }

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

.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.lab-cards-wrap {
  flex: 1;
  padding: 14px 16px;
}

.lab-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.lab-mini-card {
  border-radius: 10px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f3f4f6;
  border-left: 3px solid #d1d5db;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.lab-mini-card--pending      { border-left-color: #f59e0b; background: #fffbeb; }
.lab-mini-card--in-production { border-left-color: #3b82f6; background: #eff6ff; }
.lab-mini-card--quality      { border-left-color: #8200db; background: #faf5ff; }
.lab-mini-card--ready        { border-left-color: #22c55e; background: #f0fdf4; }
.lab-mini-card--delivered    { border-left-color: #9ca3af; background: #f9fafb; }
.lab-mini-card--urgent       { border-left-color: #e7000b; background: #fff1f2; }

.lab-mini-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.lab-mini-badge {
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
  background: #f3f4f6;
  color: #4a5565;
}

.lab-badge--pending       { background: #fef3c7; color: #92400e; }
.lab-badge--in-production { background: #dbeafe; color: #1d4ed8; }
.lab-badge--quality       { background: #f3e8ff; color: #6b21a8; }
.lab-badge--ready         { background: #dcfce7; color: #166534; }
.lab-badge--delivered     { background: #f3f4f6; color: #4a5565; }
.lab-badge--urgent        { background: #fee2e2; color: #b91c1c; }

.lab-mini-patient {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #101828;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lab-mini-rework {
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #b45309;
  display: flex;
  align-items: center;
  gap: 3px;
}

.lab-mini-rework .pi { font-size: 9px; }

.lab-mini-lens {
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #6a7282;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lab-mini-lens .pi { font-size: 10px; flex-shrink: 0; }

.lab-mini-footer {
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #99a1af;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.lab-mini-footer .pi { font-size: 10px; }

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

/* ── Section empty states (Lab Orders, Stock, Appointments) ────────────── */
.section-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px 16px;
  flex: 1;
}

.section-empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-empty-icon-wrap--teal  { background: rgba(0, 193, 176, 0.10); }
.section-empty-icon-wrap--blue  { background: rgba(147, 193, 206, 0.18); }
.section-empty-icon-wrap--green { background: rgba(34, 197, 94, 0.10); }

.section-empty-icon {
  font-size: 22px;
}

.section-empty-icon-wrap--teal  .section-empty-icon { color: #00c1b0; }
.section-empty-icon-wrap--blue  .section-empty-icon { color: #93c1ce; }
.section-empty-icon-wrap--green .section-empty-icon { color: #22c55e; }

.section-empty-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}
</style>