import { Server, Socket  } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { Groups } from './groups';

export interface User {
  id: string;
  name: string;
  group: string;
};

type TEvent = { [ key: string ]: Function[] };

export class IO {
  private _events: TEvent= {};
  private _users: { [id: string]: User } = {};
  private _userEvents: { [key: string]: TEvent} = {};
  private _groups: Groups;
  constructor(
    private _socket: Server,
  ) {
    this.on('connection', this.connection.bind(this));
    this._groups = new Groups(this);
  }
  private getUserBySocket(socket: Socket) {
    return this._users[socket.id];
  }
  private getUserByName(name: string) {
    return Object.values(this._users).find(user => user.name === name);
  }
  private getUserById(userId: string) {
    return Object.values(this._users).find(user => user.id === userId);
  }
  private setUser(socket: Socket, user: User) {
    this._users[socket.id] = user;
    this._groups.editUser(socket, user.id, user.name);
  }
  private newUser(socket: Socket) {
    const user: User = { id: uuid(), name: '', group: '' };
    this.setUser(socket, user);
    this.sendUser(socket);
    this._groups.editUser(socket, user.id, user.name);
    this._groups.userOnEvents(socket);
    return user;
  }
  private sendUser(socket: Socket) {
    const user = this.getUserBySocket(socket);
    socket.emit('user', { id: user.id, name: user.name });
  }
  private removeUser(socket: Socket) {
    const userId = this._users[socket.id].id;
    this._groups.removeUser(socket, userId);
    delete this._users[socket.id];
  }
  private connection(socket: Socket) {
    const user = this.newUser(socket);
    this.userOn(socket, 'userName', this.userName.bind(this));
    this.userOn(socket, 'disconnect', this.disconnect.bind(this));
  }
  private disconnect(socket: Socket) {
    const user = this.getUserBySocket(socket);
    this.removeUser(socket);
    this.userOffAll(socket);
  }
  public userName(socket: Socket, name: string) {
    // check if username exists, if it doesn't then set it and emit it back to the user as userName event
    // also run setUser
    let user = this.getUserByName(name);
    if (!user) {
      user = this.getUserBySocket(socket);
      if (!user) {
        return;
      }
      user.name = name;
      this.setUser(socket, user);
      this.sendUser(socket);
      this.emitUser(socket, 'userName', name);
    }
  }
  public emitUser(socket: Socket, event: string, data: any) {
    socket.emit(event, data);
  }
  public emit(event: string, data: any) {
    this._socket.emit(event, data);
  }
  public run(event: string, data?: any) {
    if (this._events[event]) {
      this._events[event].forEach(cb => cb(data));
    }
  }
  public on(event: string, callback: Function) {
    if (!this._events[event]) {
      this._events[event] = [];
      this._socket.on(event, (data?: any) => this.run(event, data));

    }
    this._events[event].push(callback);
  }
  public off(event: string) {
    if (this._events[event]) {
      this._socket.off(event, (data?: any) => this.run(event, data));
      delete this._events[event];
    }
  }
  public offAll() {
    Object.keys(this._events).forEach((event) => {
      this._socket.off(event, (data?: any) => this.run(event, data));
    });
    this._events = {};
  }
  public userRun(socket: Socket, event: string, data?: any) {
    if (this._userEvents[socket.id][event]) {
      this._userEvents[socket.id][event].forEach(cb => cb(socket, data));
    }
  }
  public userOn(socket: Socket, event: string, callback: Function) {
    if (!this._userEvents[socket.id]) {
      this._userEvents[socket.id] = {};
    }
    if (!this._userEvents[socket.id][event]) {
      this._userEvents[socket.id][event] = [];
      socket.on(event, (data?: any) => this.userRun(socket, event, data));
    }
    this._userEvents[socket.id][event].push(callback);
  }
  public userOff(socket: Socket, event: string) {
    if (this._userEvents[socket.id][event]) {
      socket.off(event, (data?: any) => this.userRun(socket, event, data));
      delete this._userEvents[socket.id][event];
    }
  }
  public userOffAll(socket: Socket) {
    Object.keys(this._userEvents[socket.id]).forEach((event) => {
      socket.off(event, (data?: any) => this.userRun(socket, event, data));
    });
    delete this._userEvents[socket.id];
  }
}