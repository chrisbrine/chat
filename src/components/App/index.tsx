'use client';
import { useEffect, useState } from 'react';
import Chat from '../Chat';
import ChangeName from '../group/name';
import GroupList from '../group/list';
import { SocketIO } from '../../data/socket';
import { User } from '../../data/users';

export default function Home() {
  const [socket, setSocket] = useState<SocketIO>(new SocketIO());
  const [userName, setUserName] = useState<string>("");
  const [validUserName, setValidUserName] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [validGroupName, setValidGroupName] = useState<boolean>(false);
  const [joinChat, setJoinChat] = useState<boolean>(false);
  const [user, setUser] = useState<User>();

  const sendUserWithDelay = (name: string) => {
    if (name) {
      socket.delayEmit('userName', name);
    } else {
      setValidUserName(false);
    }
  };

  socket.on('disconnect', 'main', () => {
    setJoinChat(false);
    setValidUserName(false);
    sendUserWithDelay(userName);
});

  socket.on('userName', 'main', (userName: string) => {
    if (userName === userName) {
      setValidUserName(true);
    }
  });

  const setUserData = (name: string, id: string) => {
    if (user) {
      user.name = name;
      user.id = id;
    } else {
      setUser(new User(name, id));
    }
  };

  const changeUserName = (name: string) => {
    setUserName(name);
    setUserData(name, user?.id || '');
    setJoinChat(false);
    setValidUserName(false);
    sendUserWithDelay(name);
  }
  const joinGroup = () => {
    if (validUserName && validGroupName) {
      setJoinChat(true);
    }
  }
  function exitChat() {
    setJoinChat(false);
  }
  const changeGroupName = (name: string) => {
    setGroupName(name);
    setValidGroupName(name.length > 0);
    setJoinChat(false);
  }
  const onSelect = (name: string) => {
    setGroupName(name);
    setValidGroupName(true);
    joinGroup();
  }
  const inChat = validUserName && validGroupName && joinChat;
  const canEnter = validUserName && validGroupName;
  useEffect(() => {
    socket.connect();
    if (socket.user) {
      setUserData(socket.user.name, socket.user.id);
    }
    socket.on('user', 'setId', (user: any) => {
      setUserData(user.name, user.id);
    });
    return () => {
      socket.disconnect();
    }
  }, []);

  return !inChat ? (
    <div className="w-screen h-screen">
      <div className="flex flex-col justify-center">
        <ChangeName
          currentName={userName}
          label="User Name"
          labelId="username"
          onChange={changeUserName}
        />
        <ChangeName
          currentName={groupName}
          label="Group Name"
          labelId="groupname"
          onChange={changeGroupName}
        />
        <button
          onClick={joinGroup}
          className={`m-2 p-2 bg-blue-500 text-white rounded-md ${canEnter ? "hover:bg-blue-600" : "bg-slate-400"}`}
        >
          Join Chat
        </button>
        <GroupList onSelect={onSelect} socket={socket} />
      </div>
    </div>
  ) : (
    <Chat
      userName={userName}
      userId={user?.id ?? ''}
      groupName={groupName}
      socket={socket}
      exitChat={exitChat}
    />
  );
}
