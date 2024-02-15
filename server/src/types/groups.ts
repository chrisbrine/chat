import { Socket } from "socket.io";
import { IO } from "./socket";

export interface GroupUser {
  id: string;
  name: string;
  socket: Socket,
}

export interface Group {
  name: string;
  users: GroupUser[];
}

export enum EMessageType {
  Text = 'text',
  // Image = 'image,
  // Video = 'video',
  // Audio = 'audio',
  // File = 'file',
  // Location = 'location',
  // Contact = 'contact',
  // Sticker = 'sticker',
  // Gif = 'gif',
  // Voice = 'voice',
  // Call = 'call',
  // System = 'system',
  // Event = 'event',
  // Other = 'other'
}

export class Groups {
  constructor(
    private _socket: IO,
    private _groups: Group[] = [],
    private _users: GroupUser[] = [],
  ) {
    this._socket.on('message', this.message.bind(this));
  }
  public userOnEvents(socket: Socket) {
    this._socket.userOn(socket, 'text', this.messageText.bind(this))
    this._socket.userOn(socket, 'join', this.joinGroup.bind(this));
    this._socket.userOn(socket, 'leave', this.leaveGroup.bind(this));
    this._socket.userOn(socket, 'groups', this.groupList.bind(this));
  }
  public get groups() {
    return this._groups;
  }
  public addGroup(group: Group) {
    this._groups.push(group);
  }
  public removeGroup(group: Group) {
    this._groups = this._groups.filter(g => g !== group);
  }
  public groupByName(name: string) {
    return this._groups.find(g => g.name === name);
  }
  public userBySocket(socket: Socket) {
    return this._users.find(u => u.socket === socket);
  }
  public userById(id: string) {
    return this._users.find(u => u.id === id);  
  }
  public userByName(name: string) {
    return this._users.find(u => u.name === name);
  }
  public addUser(id: string, name: string, socket: Socket) {
    let user = this.userById(id);
    if (!user) {
      user = { id, name, socket };
      this._users.push(user);
    }
    return user;
  }
  public removeUser(socket: Socket, id: string) {
    const user = this.userById(id);
    if (user) {
      this._groups.forEach(g => this.leaveGroup(socket, g.name));
      this._users = this._users.filter(u => u !== user);
    }
  }
  public editUser(socket: Socket, id: string, name: string) {
    // find user by socket, then modify user id and name
    const user = this._users.find(u => u.socket === socket);
    if (!user) {
      this.addUser(id, name, socket);
    } else {
      user.id = id;
      user.name = name;
    }
  }
  private groupSocketName(group: Group) {
    return `room-${group.name}`;
  }
  public joinGroup(socket: Socket, group: string) {
    const user = this.userBySocket(socket);
    if (!user) {
      return;
    }
    let groupObj = this.groupByName(group);
    if (!groupObj) {
      groupObj = { name: group, users: [] };
      this.addGroup(groupObj);
    }
    if (!groupObj.users.find(u => u === user)) {
      groupObj.users.push(user);
    }
    this.userList(socket, groupObj.name);
    this._socket.userOn(socket, this.groupSocketName(groupObj), this.message.bind(this));
    this._socket.emit('join', { group: groupObj.name, user: { id: user.id, name: user.name} });
  }
  public leaveGroup(socket: Socket, group: string) {
    const user = this.userBySocket(socket);
    if (!user) {
      return;
    }
    let groupObj = this.groupByName(group);
    if (!groupObj) {
      return;
    }
    groupObj.users = groupObj.users.filter(u => u !== user);
    if (groupObj.users.length === 0) {
      this.removeGroup(groupObj);
    }
    this._socket.userOff(socket, this.groupSocketName(groupObj));
    this._socket.emit('leave', { group: groupObj.name, user: { id: user.id, name: user.name} });
  }
  public send(group: Group, user: GroupUser, type: EMessageType, content: any) {
    this._socket.emit('message', { group: group.name, user: {id: user.id, name: user.name}, type, content });
  }
  public message({
    group, userId, type, content,
  } : {
    group: string, userId: string, type: EMessageType, content: any,
  }) {
    const groupObj = this.groupByName(group);
    const user = this.userById(userId);
    if (groupObj && user) {
      this.send(groupObj, user, type, content);
    }
  }
  public messageText(socket: Socket, content: string) {
    const user = this._users.find(u => u.socket === socket);
    if (!user) {
      return;
    }
    const group = this._groups.find(g => g.name && g.name !== user?.name);
    if (group) {
      this.send(group, user, EMessageType.Text, content);
    }
  }
  public groupList(socket: Socket) {
    const user = this._users.find(u => u.socket === socket);
    if (!user) {
      return;
    }
    const groups = this._groups
      .filter(g => g.name && g.name !== user?.name)
      .map(g => [g.name, g.users.length]);
    this._socket.emitUser(socket, 'groups', groups);
  }
  public userList(socket: Socket, group: string) {
    const groupObj = this.groupByName(group);
    if (!groupObj) {
      return;
    }
    const users = groupObj.users.map(u => ({ id: u.id, name: u.name }));
    this._socket.emitUser(socket, 'groupUsers', users);
  }
}