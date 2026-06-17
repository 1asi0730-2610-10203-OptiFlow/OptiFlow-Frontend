import { AnalyticsReport } from '../domain/model/analytics-report.entity.js'
import { StaffMetric }     from '../domain/model/staff-metric.entity.js'

export class DashboardAssembler {
  static toAnalyticsReport(raw) {
    // Normaliza camelCase del backend → snake_case que espera la entidad AnalyticsReport
    return new AnalyticsReport({
      report_id:               raw.id                    ?? raw.report_id,
      report_uuid:             raw.reportUuid            ?? raw.report_uuid            ?? '',
      generated_by:            raw.generatedBy           ?? raw.generated_by           ?? '',
      period:                  raw.period                ?? '',
      generated_at:            raw.generatedAt           ?? raw.generated_at           ?? '',
      total_revenue:           raw.totalRevenue          ?? raw.total_revenue          ?? 0,
      total_transactions:      raw.totalTransactions     ?? raw.total_transactions     ?? 0,
      conversion_rate:         raw.conversionRate        ?? raw.conversion_rate        ?? 0,
      average_delivery_days:   raw.averageDeliveryDays   ?? raw.average_delivery_days  ?? 0,
      on_time_delivery_rate:   raw.onTimeDeliveryRate    ?? raw.on_time_delivery_rate  ?? 0,
      rework_rate:             raw.reworkRate            ?? raw.rework_rate            ?? 0,
      total_orders:            raw.totalOrders           ?? raw.total_orders           ?? 0,
      pending_balance_0_7:     raw.pendingBalance0To7    ?? raw.pending_balance_0_7    ?? 0,
      pending_balance_8_15:    raw.pendingBalance8To15   ?? raw.pending_balance_8_15   ?? 0,
      pending_balance_16_30:   raw.pendingBalance16To30  ?? raw.pending_balance_16_30  ?? 0,
      pending_balance_over_30: raw.pendingBalanceOver30  ?? raw.pending_balance_over_30 ?? 0,
    })
  }

  static toAnalyticsReportList(rawList) {
    return rawList.map(DashboardAssembler.toAnalyticsReport)
  }

  static toStaffMetric(raw) {
    // Normaliza camelCase del backend → snake_case que espera la entidad StaffMetric
    return new StaffMetric({
      staff_metric_id:   raw.id               ?? raw.staff_metric_id,
      report_id:         raw.reportId          ?? raw.report_id,
      employee_name:     raw.employeeName      ?? raw.employee_name      ?? '',
      quotations_issued: raw.quotationsIssued  ?? raw.quotations_issued  ?? 0,
      sales_closed:      raw.salesClosed       ?? raw.sales_closed       ?? 0,
      total_revenue:     raw.totalRevenue      ?? raw.total_revenue      ?? 0,
    })
  }

  static toStaffMetricList(rawList) {
    return rawList.map(DashboardAssembler.toStaffMetric)
  }
}