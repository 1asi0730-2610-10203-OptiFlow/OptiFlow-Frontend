export class Report {
  constructor({
    id,
    title,
    description,
    type,
    created_at,
    data = {}
  }) {
    this.id = id
    this.title = title
    this.description = description
    this.type = type
    this.createdAt = created_at
    this.data = data
  }
}
