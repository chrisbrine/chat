import io from 'socket.io-client';
import { User } from './users';

const port = 4000;
const host = window.location.hostname;

type eventFunction = (data?: any) => void;
type eventFunctionMap = {[key: string]: eventFunction};

export class SocketIO {
  private onEvents: {[key: string]: eventFunctionMap} = {};
  private delayID: {[key: string]: any} = {};
  private _user: User | null = null;
  constructor(
    private _socket = io(`http://${host}:${port}`, {
      autoConnect: false,
    }),
  ) {
    this.on('disconnect', 'reconnect', () => {
      this.connect();
    });
    this.on('user', 'main', (user: User) => {
      this._user = user;
    });
  }

  public connect() {
    this._socket.connect();
  }

  public get socket() {
    return this._socket;
  }

  public get user() {
    return this._user;
  }

  public disconnect() {
    this.offAll();
    this._socket.disconnect();
  }

  public runSocketEvent(event: string, data: any) {
    if (this.onEvents[event]) {
      Object.values(this.onEvents[event]).forEach((callback) => callback(data));
      // this.onEvents[event].forEach((callback) => callback(data));
    }
  }

  public on(event: string, label: string, callback: (data: any) => void) {
    if (!this.onEvents[event]) {
      this.onEvents[event] = {};
      this._socket.on(event, (data: any) => this.runSocketEvent(event, data));
    }
    this.onEvents[event][label] = callback;
  }

  public off(event: string) {
    if (this.onEvents[event]) {
      Object.values(this.onEvents[event]).forEach((callback) => {
        this._socket.off(event);
      });
      delete this.onEvents[event];
    }
  }

  public offOne(event: string, label: string) {
    if (this.onEvents[event]) {
      delete this.onEvents[event][label];
      if (Object.keys(this.onEvents[event]).length === 0) {
        this._socket.off(event);
        delete this.onEvents[event];
      }
    }
  }

  public offAll() {
    Object.keys(this.onEvents).forEach((event) => {
      this._socket.off(event);
    });
    this.onEvents = {};
  }

  public emit(event: string, data?: any) {
    this._socket.emit(event, data);
  }

  public delayEmit(event: string, data: any, delay: number = 1000) {
    if (this.delayID[event]) {
      clearTimeout(this.delayID[event]);
    }
    this.delayID[event] = setTimeout(() => {
      this.emit(event, data);
    }, delay);
  }
}
