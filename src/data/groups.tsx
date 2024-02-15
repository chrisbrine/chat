import { User } from "./users";

export class Group {
  private _users: User[] | null = null;
  constructor(
    private _name: string,
    private _userCount: number,
  ) {}
  public get name() {
    return this._name;
  }
  public get userCount() {
    return this._userCount;
  }
  public get users() {
    return this._users ?? [];
  }
  public set users(users: User[]) {
    // remove all duplicates from users via a loop
    const userSet = new Set();
    const userResult: User[] = [];
    users.forEach(user => {
      if (!userSet.has(user.id)) {
        userSet.add(user.id);
        userResult.push(user);
      }
    });
    this._users = userResult;
  }
  public addUser(user: User) {
    if (!this._users) {
      this._users = [];
    }
    this._users.push(user);
  }
}

export class Groups {
  private _groups: Group[];
  constructor(groups: [string, number][] = []) {
    this._groups = groups.map(([name, userCount]) => new Group(name, userCount));
  }
  public get groups() {
    return this._groups;
  }
}

