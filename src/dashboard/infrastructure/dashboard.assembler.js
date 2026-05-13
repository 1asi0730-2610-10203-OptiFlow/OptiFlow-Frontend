import { AnalyticsReport } from '../domain/model/analytics-report.entity.js'
import { StaffMetric }     from '../domain/model/staff-metric.entity.js'

export class DashboardAssembler {
  static toAnalyticsReport(raw) {
    return new AnalyticsReport(raw)
  }

  static toAnalyticsReportList(rawList) {
    return rawList.map(DashboardAssembler.toAnalyticsReport)
  }

  static toStaffMetric(raw) {
    return new StaffMetric(raw)
  }

  static toStaffMetricList(rawList) {
    return rawList.map(DashboardAssembler.toStaffMetric)
  }
}
