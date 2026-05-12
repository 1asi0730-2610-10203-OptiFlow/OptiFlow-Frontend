export class AnalyticsReport {
  constructor({
    report_id,
    report_uuid,
    generated_by,
    period,
    generated_at,
    total_revenue,
    total_transactions,
    conversion_rate,
    average_delivery_days,
    on_time_delivery_rate,
    rework_rate,
    total_orders,
    pending_balance_0_7,
    pending_balance_8_15,
    pending_balance_16_30,
    pending_balance_over_30,
  }) {
    this.reportId             = report_id
    this.reportUuid           = report_uuid
    this.generatedBy          = generated_by
    this.period               = period
    this.generatedAt          = generated_at
    this.totalRevenue         = total_revenue         ?? 0
    this.totalTransactions    = total_transactions    ?? 0
    this.conversionRate       = conversion_rate       ?? 0
    this.averageDeliveryDays  = average_delivery_days ?? 0
    this.onTimeDeliveryRate   = on_time_delivery_rate ?? 0
    this.reworkRate           = rework_rate           ?? 0
    this.totalOrders          = total_orders          ?? 0
    this.pendingBalance0_7    = pending_balance_0_7   ?? 0
    this.pendingBalance8_15   = pending_balance_8_15  ?? 0
    this.pendingBalance16_30  = pending_balance_16_30 ?? 0
    this.pendingBalanceOver30 = pending_balance_over_30 ?? 0
  }
}
