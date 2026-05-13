<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// --- Mock Data ---
const activeTab = ref('resumen')
const selectedPeriod = ref({ label: 'Últimos 6 meses', value: 6 })

const kpis = computed(() => [
  { icon: '💰', value: 'S/ 303,693', label: t('reports.kpis.totalRevenue'), subtext: t('reports.kpis.total6Months'), trend: '+18%', trendUp: true },
  { icon: '📊', value: '86%', label: t('reports.kpis.conversionRate'), subtext: t('reports.kpis.recipeToSale'), trend: '+9pts', trendUp: true },
  { icon: '⏱️', value: '3.9 días', label: t('reports.kpis.avgDeliveryTime'), subtext: t('reports.kpis.vsPreviousQuarter'), trend: '-0.8d', trendUp: true },
  { icon: '⚠️', value: 'S/ 16,660', label: t('reports.kpis.pendingBalances'), subtext: t('reports.kpis.openInvoices', { count: 52 }), trend: '+5%', trendUp: false }
])

const chartData = [
  { month: 'Nov', value: 140 },
  { month: 'Dic', value: 175 },
  { month: 'Ene', value: 160 },
  { month: 'Feb', value: 190 },
  { month: 'Mar', value: 210 },
  { month: 'Abr', value: 200 }
]

const donutData = computed(() => [
  { label: t('reports.products.progressive'), value: 38, color: '#00c1b0' },
  { label: t('reports.products.singleVision'), value: 24, color: '#a3e635' },
  { label: t('reports.products.contactLenses'), value: 18, color: '#93c5fd' },
  { label: t('reports.products.accessories'), value: 12, color: '#fbbf24' },
  { label: t('reports.products.others'), value: 8, color: '#ef4444' }
])

// --- Bar Chart Geometry ---
const BC = { left: 40, right: 740, top: 20, bottom: 180 }
const bcW = BC.right - BC.left
const bcH = BC.bottom - BC.top

const barData = [
  { month: 'Nov', recipes: 110, sales: 145 },
  { month: 'Dic', recipes: 130, sales: 178 },
  { month: 'Ene', recipes: 120, sales: 160 },
  { month: 'Feb', recipes: 150, sales: 195 },
  { month: 'Mar', recipes: 170, sales: 220 },
  { month: 'Abr', recipes: 160, sales: 200 }
]

const maxBarVal = 220
const gridValues = [0, 55, 110, 165, 220]

function bx(i, total) { return BC.left + i * (bcW / total) + (bcW / total) / 4 }
function by(v) { return BC.bottom - (v / maxBarVal) * bcH }
function bh(v) { return (v / maxBarVal) * bcH }

const gridLines = gridValues.map(v => ({ y: by(v), label: v }))
const xLabels = barData.map((d, i) => ({ x: BC.left + i * (bcW / barData.length) + (bcW / barData.length) / 2, label: d.month }))

const bars = barData.map((d, i) => ({
  x: BC.left + i * (bcW / barData.length) + (bcW / barData.length) / 4,
  y: by(d.sales),
  w: (bcW / barData.length) / 2,
  h: bh(d.sales),
  month: d.month
}))

// --- Revenue Trend Chart Geometry ---
const RC = { left: 50, right: 900, top: 20, bottom: 180 }
const rcW = RC.right - RC.left
const rcH = RC.bottom - RC.top

const revData = [38000, 52000, 42000, 58000, 64000, 49000]
const maxRev = 80000

function rx(i, total) { return RC.left + i * (rcW / (total - 1)) }
function ry(v) { return RC.bottom - (v / maxRev) * rcH }

const revPts = computed(() => revData.map((v, i) => `${rx(i, revData.length).toFixed(1)},${ry(v).toFixed(1)}`).join(' '))
const revAreaPts = computed(() => `${revPts.value} ${RC.right},${RC.bottom} ${RC.left},${RC.bottom}`)
const revDots = computed(() => revData.map((v, i) => ({ cx: rx(i, revData.length).toFixed(1), cy: ry(v).toFixed(1) })))

const revGridLines = [0, 20000, 40000, 60000, 80000].map(v => ({
  y: ry(v),
  label: v === 0 ? 'S/0k' : `S/${v / 1000}k`
}))

const revXLabels = computed(() => barData.map((d, i) => ({
  x: rx(i, barData.length).toFixed(1),
  label: d.month
})))

// --- Donut Chart Logic ---
const donutRadius = 60
const donutThickness = 18
const center = 80

const donutSegments = computed(() => {
  let currentAngle = -90 // Start from top
  return donutData.value.map(item => {
    const angle = (item.value / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle += angle
    
    // Convert polar to cartesian
    const x1 = center + donutRadius * Math.cos(Math.PI * startAngle / 180)
    const y1 = center + donutRadius * Math.sin(Math.PI * startAngle / 180)
    const x2 = center + donutRadius * Math.cos(Math.PI * endAngle / 180)
    const y2 = center + donutRadius * Math.sin(Math.PI * endAngle / 180)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    const path = `M ${x1} ${y1} A ${donutRadius} ${donutRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    
    return { path, color: item.color, label: item.label, percent: item.value }
  })
})
</script>

<template>
  <div class="report-container">
    <!-- Header Section -->
    <header class="report-header">
      <div class="title-section">
        <h1>{{ $t('reports.title') }}</h1>
        <p class="subtitle">{{ $t('reports.subtitle') }} · Abril 2026</p>
      </div>
      <div class="header-actions">
        <div class="period-selector">
          <i class="pi pi-calendar"></i>
          <span>{{ $t('reports.periodSelector') }}</span>
          <i class="pi pi-chevron-down"></i>
        </div>
        <pv-button :label="$t('reports.export')" icon="pi pi-download" class="export-btn" />
        <pv-button icon="pi pi-refresh" text rounded class="refresh-btn" />
      </div>
    </header>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-icon">{{ kpi.icon }}</span>
          <span :class="['trend-badge', kpi.trendUp ? 'up' : 'down']">
            <i :class="['pi', kpi.trendUp ? 'pi-arrow-up-right' : 'pi-chart-line']"></i>
            {{ kpi.trend }}
          </span>
        </div>
        <div class="kpi-value">{{ kpi.value }}</div>
        <div class="kpi-label">{{ kpi.label }}</div>
        <div class="kpi-subtext">{{ kpi.subtext }}</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="report-tabs">
      <button 
        :class="['tab-item', { active: activeTab === 'resumen' }]"
        @click="activeTab = 'resumen'"
      >
        <i class="pi pi-chart-line"></i>
        {{ $t('reports.resumen') }}
      </button>
      <button 
        :class="['tab-item', { active: activeTab === 'sales' }]"
        @click="activeTab = 'sales'"
      >
        <i class="pi pi-shopping-bag"></i>
        {{ $t('reports.salesFinance') }}
      </button>
      <button 
        :class="['tab-item', { active: activeTab === 'productivity' }]"
        @click="activeTab = 'productivity'"
      >
        <i class="pi pi-clock"></i>
        {{ $t('reports.productivityLab') }}
      </button>
      <button 
        :class="['tab-item', { active: activeTab === 'personal' }]"
        @click="activeTab = 'personal'"
      >
        <i class="pi pi-users"></i>
        {{ $t('reports.personalPerformance') }}
      </button>
    </nav>

    <!-- Main Content Area -->
    <div class="report-main">
      <div class="main-card bar-chart-section">
        <div class="card-header">
          <div class="card-title-group">
            <h3>{{ $t('reports.charts.conversionTitle') }}</h3>
            <p>{{ $t('reports.charts.conversionSubtitle') }}</p>
          </div>
          <span class="month-indicator">86% {{ $t('reports.charts.currentMonth') }}</span>
        </div>
        
        <div class="bar-chart-container">
          <svg viewBox="0 0 780 220" class="bar-svg">
            <line
              v-for="g in gridLines" :key="g.label"
              :x1="BC.left" :y1="g.y" :x2="BC.right" :y2="g.y"
              stroke="#f3f4f6" stroke-width="1" stroke-dasharray="4"
            />
            <text
              v-for="g in gridLines" :key="'y' + g.label"
              :x="BC.left - 10" :y="g.y + 4"
              fill="#9ca3af" font-size="11" text-anchor="end"
            >{{ g.label }}</text>
            <text
              v-for="xl in xLabels" :key="xl.label"
              :x="xl.x" :y="BC.bottom + 25"
              fill="#9ca3af" font-size="11" text-anchor="middle"
            >{{ xl.label }}</text>
            
            <rect
              v-for="b in bars" :key="b.month"
              :x="b.x" :y="b.y" :width="b.w" :height="b.h"
              fill="#00c1b0" rx="6"
            />
          </svg>
        </div>
        
        <div class="chart-legend centered">
          <span class="legend-item"><span class="dot bg-light"></span> {{ $t('reports.charts.prescriptions') }}</span>
          <span class="legend-item"><span class="dot bg-main"></span> {{ $t('reports.charts.closedSales') }}</span>
        </div>
      </div>

      <div class="main-card donut-chart-section">
        <div class="card-header">
          <div class="card-title-group">
            <h3>{{ $t('reports.charts.salesByProduct') }}</h3>
            <p>{{ $t('reports.charts.periodDistribution') }}</p>
          </div>
        </div>

        <div class="donut-container">
          <svg viewBox="0 0 160 160" class="donut-svg">
            <circle :cx="center" :cy="center" :r="donutRadius" fill="none" stroke="#f3f4f6" :stroke-width="donutThickness" />
            <path 
              v-for="seg in donutSegments" 
              :key="seg.label"
              :d="seg.path"
              fill="none"
              :stroke="seg.color"
              :stroke-width="donutThickness"
              stroke-linecap="round"
            />
          </svg>
          <div class="donut-legend">
            <div v-for="item in donutData" :key="item.label" class="legend-row">
              <div class="legend-info">
                <span class="dot" :style="{ background: item.color }"></span>
                <span class="label-text">{{ item.label }}</span>
              </div>
              <span class="percent-text">{{ item.value }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- New Trend Chart -->
      <div class="main-card full-card trend-chart-section">
        <div class="card-header">
          <div class="card-title-group">
            <h3>{{ $t('reports.charts.revenueTrendTitle') }}</h3>
            <p>{{ $t('reports.charts.revenueTrendSubtitle', { total: 'S/ 303,693' }) }}</p>
          </div>
        </div>
        
        <div class="trend-chart-container">
          <svg viewBox="0 0 950 220" class="trend-svg">
            <line
              v-for="g in revGridLines" :key="g.label"
              :x1="RC.left" :y1="g.y" :x2="RC.right" :y2="g.y"
              stroke="#f3f4f6" stroke-width="1" stroke-dasharray="4"
            />
            <text
              v-for="g in revGridLines" :key="'y' + g.label"
              :x="RC.left - 10" :y="g.y + 4"
              fill="#9ca3af" font-size="11" text-anchor="end"
            >{{ g.label }}</text>
            <text
              v-for="xl in revXLabels" :key="xl.label"
              :x="xl.x" :y="RC.bottom + 25"
              fill="#9ca3af" font-size="11" text-anchor="middle"
            >{{ xl.label }}</text>
            
            <polygon :points="revAreaPts" fill="#00c1b0" opacity="0.06" />
            <polyline :points="revPts" fill="none" stroke="#00c1b0" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            <circle v-for="d in revDots" :cx="d.cx" :cy="d.cy" r="4" fill="white" stroke="#00c1b0" stroke-width="2" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@600;700&family=Montserrat:wght@400;500;600&display=swap');

.report-container {
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  color: #1f2937;
}

/* Header Styles */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.title-section h1 {
  font-family: 'Josefin Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  cursor: pointer;
}

.export-btn {
  background-color: #00c1b0 !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 10px 20px !important;
}

.refresh-btn {
  color: #6b7280 !important;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.kpi-card {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kpi-icon {
  font-size: 20px;
  background: #f3f4f6;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.trend-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-badge.up { color: #10b981; background: #ecfdf5; }
.trend-badge.down { color: #ef4444; background: #fef2f2; }

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #111827;
}

.kpi-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.kpi-subtext {
  font-size: 12px;
  color: #00c1b0;
  margin-top: 4px;
}

/* Tabs Navigation */
.report-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px 12px 0 0;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-item.active {
  color: #00c1b0;
  background: #f0fdfa;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #00c1b0;
}

/* Main Cards */
.report-main {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 24px;
}

.main-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #f3f4f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.card-title-group h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.card-title-group p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

.month-indicator {
  background: #f0fdfa;
  color: #00c1b0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Bar Chart */
.bar-chart-container {
  display: flex;
  gap: 16px;
  height: 240px;
  margin-top: 10px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #9ca3af;
  font-size: 11px;
  text-align: right;
  width: 30px;
}

.bars-area {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  border-bottom: 1px dashed #e5e7eb;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 40px;
}

.bar-pair {
  position: relative;
  width: 24px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
  transition: height 0.3s ease;
}

.bar-bg { background: #6ee7b7; opacity: 0.3; width: 100%; position: absolute; }
.bar-main { background: #00c1b0; width: 100%; z-index: 1; }

.bar-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.chart-legend {
  display: flex;
  gap: 20px;
  margin-top: 24px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.bg-light { background: #6ee7b7; }
.dot.bg-main { background: #00c1b0; }

.chart-legend.centered {
  justify-content: center;
}

.bar-svg {
  width: 100%;
  height: 100%;
}

.bar-chart-container {
  height: 220px;
  width: 100%;
}

.full-card {
  grid-column: 1 / -1;
  margin-top: 8px;
}

.trend-chart-container {
  height: 220px;
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: 100%;
}

/* Donut Chart */
.donut-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.donut-svg {
  width: 200px;
  height: 200px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
}

.donut-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.legend-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.percent-text {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}
</style>
