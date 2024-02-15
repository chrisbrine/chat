import { v4 as uuid4 } from 'uuid';

export class User {
  constructor(
    private _name: string,
    private _id: string = uuid4(),
  ) {
  }
  public get id() {
    return this._id;
  }
  public get name() {
    return this._name;
  }
  public set id(newId: string) {
    this._id = newId;
  }
  public set name(newName: string) {
    this._name = newName;
  }
}

export class Users {
  private _current: User;
  private _users: User[];
  constructor(userName: string, userId: string = uuid4()) {
    this._users = [];
    this._current = this.addUser(userName, userId);
  }
  public get users() {
    return this._users;
  }
  public get current() {
    return this._current;
  }
  public addUser(name: string, id: string = uuid4()) {
    // check if user already exists or not
    let user = this.getUserByName(name);
    if (user) {
      return user;
    }
    user = new User(name, id);
    this._users.push(user);
    return user;
  }
  public addUsers(users: [string, string][]|[string][]) {
    users.forEach(user => {
      if (user.length === 1) {
        this.addUser(user[0]);
      } else {
        this.addUser(user[0], user[1]);
      }
    });
  }
  public clearUsers() {
    this._users = [this._current];
  }
  public removeUser(user: User) {
    this._users = this._users.filter(u => u !== user);
  }
  public removeUserById(id: string) {
    this._users = this._users.filter(user => user.id !== id);
  }
  public getUserById(id: string) {
    return this._users.find(user => user.id === id);
  }
  public getUserByName(name: string) {
    return this._users.find(user => user.name === name);
  }
}
