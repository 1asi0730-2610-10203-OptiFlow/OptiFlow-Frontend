import { Report } from '../domain/model/report.entity.js'

export class ReportAssembler {
  static toDomain(dto) {
    return new Report(dto)
  }

  static toDomainList(dtos) {
    return dtos.map(dto => this.toDomain(dto))
  }
}
