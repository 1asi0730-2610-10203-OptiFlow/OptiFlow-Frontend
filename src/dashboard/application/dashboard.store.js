import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import DashboardApi       from '../infrastructure/dashboard-api.js'
import { DashboardAssembler } from '../infrastructure/dashboard.assembler.js'
import { SaleAssembler } from '../../sales/infrastructure/sale.assembler.js'

const api = new DashboardApi()

export const useDashboardStore = defineStore('dashboard', () => {
  // ── Raw state ────────────────────────────────────────────────────────────
  const analyticsReports = ref([])
  const staffMetrics     = ref([])
  const patients         = ref([])
  const workOrders       = ref([])
  const sales            = ref([])
  const products         = ref([])
  const loading          = ref(false)
  const error            = ref(null)

  // ── Derived: stat cards ──────────────────────────────────────────────────

  /** Total de pacientes registrados */
  const totalPatients = computed(() => patients.value.length)

  /** Pacientes distintos con una venta registrada hoy */
  const todaysAttendedPatients = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    const seen = new Map()
    sales.value
      .filter(s => s.createdAt?.startsWith(today))
      .forEach(s => {
        if (!seen.has(s.patientId)) {
          seen.set(s.patientId, { patientId: s.patientId, patientName: s.patientName })
        }
      })
    return [...seen.values()]
  })

  /** Pacientes atendidos hoy (conteo) */
  const patientsSeenToday = computed(() => todaysAttendedPatients.value.length)

  /** Ingreso mensual: suma del reporte del periodo más reciente */
  const monthlyRevenue = computed(() => {
    if (!analyticsReports.value.length) return 0
    const sorted = [...analyticsReports.value].sort((a, b) =>
      b.period.localeCompare(a.period)
    )
    return sorted[0].totalRevenue
  })

  /** Órdenes de laboratorio pendientes */
  const pendingLabOrders = computed(() =>
    workOrders.value.filter(o =>
      o.status === 'PENDING' || o.status === 'IN_PRODUCTION'
    ).length
  )

  // ── Derived: line chart (conversion recetas → ventas) ───────────────────
  // Usamos analyticsReports ordenados por periodo para los últimos 6 meses

  const sortedReports = computed(() =>
    [...analyticsReports.value].sort((a, b) => a.period.localeCompare(b.period))
  )

  /** Valores para la línea de "Órdenes de Laboratorio" (total_orders) */
  const recetasChartData = computed(() =>
    sortedReports.value.map(r => r.totalOrders)
  )

  /** Valores para la línea de "Ventas" (total_transactions) */
  const ventasChartData = computed(() =>
    sortedReports.value.map(r => r.totalTransactions)
  )

  /** Etiquetas del eje X (periodos: "2026-04" → "Abr") */
  const chartPeriodLabels = computed(() =>
    sortedReports.value.map(r => r.period)
  )

  // ── Derived: bar chart (ingresos por reporte) ────────────────────────────
  const weekRevenueData = computed(() =>
    sortedReports.value.map(r => r.totalRevenue)
  )

  // ── Derived: work orders para la sección Lab Orders ──────────────────────
  const recentWorkOrders = computed(() =>
    [...workOrders.value]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  )

  // ── Derived: stock alerts (productos con stock bajo) ─────────────────────
  const stockAlerts = computed(() =>
    products.value
      .filter(p => p.stock <= p.minimumStockThreshold * 2)
      .map(p => ({
        name:      p.name,
        remaining: p.stock,
        min:       p.minimumStockThreshold,
        pct:       p.minimumStockThreshold > 0
          ? Math.min(100, Math.round((p.stock / (p.minimumStockThreshold * 2)) * 100))
          : 0,
      }))
      .slice(0, 5)
  )

  // ── Actions ──────────────────────────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    error.value   = null

    const results = await Promise.allSettled([
      api.getAnalyticsReports(),
      api.getStaffMetrics(),
      api.getPatients(),
      api.getWorkOrders(),
      api.getSales(),
      api.getProducts(),
    ])

    const [
      analyticsRes,
      staffRes,
      patientsRes,
      workOrdersRes,
      salesRes,
      productsRes,
    ] = results

    // Each failed request falls back to empty array — dashboard shows zeros
    analyticsReports.value = analyticsRes.status === 'fulfilled'
      ? DashboardAssembler.toAnalyticsReportList(analyticsRes.value)
      : []

    staffMetrics.value = staffRes.status === 'fulfilled'
      ? DashboardAssembler.toStaffMetricList(staffRes.value)
      : []

    patients.value   = patientsRes.status   === 'fulfilled' ? patientsRes.value   : []
    workOrders.value = workOrdersRes.status === 'fulfilled' ? workOrdersRes.value : []
    sales.value      = salesRes.status      === 'fulfilled'
      ? SaleAssembler.toEntitiesFromResponse(salesRes.value)
      : []
    products.value   = productsRes.status   === 'fulfilled' ? productsRes.value   : []

    // Mark error only if ALL requests failed
    const allFailed = results.every(r => r.status === 'rejected')
    if (allFailed) {
      error.value = results[0].reason?.message ?? 'API unavailable'
    }

    loading.value = false
  }

  return {
    // state
    loading,
    error,
    // computed
    totalPatients,
    patientsSeenToday,
    todaysAttendedPatients,
    monthlyRevenue,
    pendingLabOrders,
    recetasChartData,
    ventasChartData,
    chartPeriodLabels,
    weekRevenueData,
    recentWorkOrders,
    stockAlerts,
    analyticsReports,
    staffMetrics,
    workOrders,
    sales,
    products,
    // actions
    fetchAll,
  }
})
