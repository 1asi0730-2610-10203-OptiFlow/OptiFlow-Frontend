import { User } from '../domain/model/user.entity.js';

export class UserAssembler {
  static toEntity(resource) {
    if (!resource) return null;
    return new User(resource.id || resource.user_id, resource.email || resource.username);
  }
}
