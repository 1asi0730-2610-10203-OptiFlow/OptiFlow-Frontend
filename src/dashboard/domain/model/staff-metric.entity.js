export class StaffMetric {
  constructor({
    staff_metric_id,
    report_id,
    employee_name,
    quotations_issued,
    sales_closed,
    total_revenue,
  }) {
    this.staffMetricId    = staff_metric_id
    this.reportId         = report_id
    this.employeeName     = employee_name     ?? ''
    this.quotationsIssued = quotations_issued ?? 0
    this.salesClosed      = sales_closed      ?? 0
    this.totalRevenue     = total_revenue     ?? 0
  }
}
