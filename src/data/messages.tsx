import { v4 as uuid } from 'uuid';
// import { User } from './users';

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


class MessageBase {
  protected _id: string;
  constructor(
    protected _from: {name: string, id: string},
    protected _type: EMessageType,
    protected _content: any,
    protected _timestamp: number = Date.now(),
    protected _editTimestamp: number = Date.now(),
    protected _edited: boolean = false,
  ) {
    this._id = uuid();
  }
  public get id() {
    return this._id;
  }
  public get type() {
    return this._type;
  }
  public get from() {
    return this._from;
  }
  public get content() {
    return this._content;
  }
  public set content(newContent: any) {
    this._edited = true;
    this._editTimestamp = Date.now();
    this._content = newContent;
  }
  public get timestamp() {
    return this._timestamp;
  }
}

class TextMessage extends MessageBase {
  constructor(
    protected _from: {name: string, id: string},
    protected _content: string,
  ) {
    const currentDate: number = Date.now();
    super(_from, EMessageType.Text, _content, currentDate, currentDate, false);
  }
}

export type Message = TextMessage;

export class Messages {
  constructor(
    private _groupName: string,
    private _from: {name: string, id: string},
    private _messages: Message[] = [],
  ) {}

  public get groupName() {
    return this._groupName;
  }

  public get from() {
    return this._from;
  }

  public get messages() {
    return this._messages;
  }

  public text(content: string) {
    if (content) {
      this._messages.push(new TextMessage(this._from, content));
    }
  }

  public receiveText(from: {name: string, id: string}, content: string) {
    if (content) {
      this._messages.push(new TextMessage(from, content));
    }
  }

  public editText(id: string, content: string) {
    if (content) {
      const message = this._messages.find((m) => m.id === id);
      if (message) {
        message.content = content;
      }
    }
  }

  editMessage(id: string, newContent: any) {
    const message = this.messages.find((m) => m.id === id);
    if (message) {
      message.content = newContent;
    }
  }

  deleteMessage(id: string) {
    this._messages = this._messages.filter((m) => m.id !== id);
  }
}
