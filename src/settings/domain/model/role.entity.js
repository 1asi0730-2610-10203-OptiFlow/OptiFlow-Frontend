export class Role {
    constructor(id, name, description, userCount, color, permissions = [], internalName = '') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.userCount = userCount;
        this.color = color;
        this.permissions = permissions;
        this.internalName = internalName;
    }
}
