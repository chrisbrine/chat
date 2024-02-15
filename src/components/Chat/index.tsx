'use client';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Messages from '../messages';
import Input from '../input';
import UserList from './users';
import { EMessageType, Messages as MessagesData } from '../../data/messages';
import { User, Users } from '../../data/users';
import { SocketIO } from '../../data/socket';

export default function Chat({
  userName,
  userId,
  groupName,
  socket,
  exitChat,
}: {
  userName: string,
  userId: string,
  groupName: string,
  socket: SocketIO
  exitChat: () => void,
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [messageData] = useState<MessagesData>(new MessagesData(groupName, {name: userName, id: userId}));
  const [messages, setMessages] = useState(messageData.messages);
  const [darkMode, setDarkMode] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  socket.on('message', groupName, (data: any) => {
    switch (data.type) {
      case EMessageType.Text:
        let user = users.find((u: any) => u.id === data.user.id);
        // let user = users.getUserById(data.user.id);
        if (!user) {
          setUsers([...users, data.user]);
          // user = users.addUser(data.user.name, data.user.id);
        }
        console.log('received', data.user, data);
        messageData.receiveText(data.user, data.content);
        setMessages([...messageData.messages]);
        break;
    }
  });
  socket.on('groupUsers', groupName, (groupUsers: {id: string, name: string}[]) => {
    // users.addUsers(groupUsers.map(u => [u.name, u.id]));
    setUsers(groupUsers);
  });
  socket.on('join', groupName, (
    {group, user}: {group: string, user: {name: string, id: string}}
  ) => {
    if (group === groupName) {
      const userExists = users.find((u: any) => u.id === user.id);
      if (!userExists) {
        setUsers([...users, user]);
        // users.addUser(user.name, user.id);
      }
      // users.addUser(user.name, user.id);
    }
  });
  socket.on('leave', groupName, (
    {group, user}: {group: string, user: {name: string, id: string}}
  ) => {
    if (group === groupName) {
      setUsers(users.filter(u => u.id !== user.id));
      // users.removeUserById(user.id);
    }
  });
  function leaveGroup() {
    socket.emit('leave', groupName);
    exitChat();
  }
  useEffect(() => {
    socket.emit('join', groupName);
    return () => {
      socket.emit('leave', groupName);
    }
  }, []);
  // const [to] = useState<User>(users.addUser("User 2", uuid()));
  const onSend = (type: EMessageType, content: any) => {
    switch (type) {
      case EMessageType.Text:
        socket.delayEmit('text', content);
        break;    
    }
  }
  function toggleDarkMode() {
    if (!localStorage.theme) {
      localStorage.theme = 'dark';
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      localStorage.removeItem('theme');
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('light');
    }
  }
  function DarkModeIcon() {
    // return dark mode icon as an SVG in the shape of a crescent moon
    const color = darkMode ? 'yellow' : 'black';
    return (
      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill={color} version="1.1" id="Capa_1" width="24px" height="24px" viewBox="0 0 30.457 30.457" xmlSpace="preserve">
        <g>
          <path d="M29.693,14.49c-0.469-0.174-1-0.035-1.32,0.353c-1.795,2.189-4.443,3.446-7.27,3.446c-5.183,0-9.396-4.216-9.396-9.397   c0-2.608,1.051-5.036,2.963-6.835c0.366-0.347,0.471-0.885,0.264-1.343c-0.207-0.456-0.682-0.736-1.184-0.684   C5.91,0.791,0,7.311,0,15.194c0,8.402,6.836,15.238,15.238,15.238c8.303,0,14.989-6.506,15.219-14.812   C30.471,15.118,30.164,14.664,29.693,14.49z"/>
        </g>
      </svg>
    )
  }
  function LeftArrow() {
    // return svg for a left arrow
    return (
      <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" width="24px" height="24px" viewBox="0 0 24 24" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z" fill="currentColor"/>
      </svg>
    )
  }
  useEffect(() => {
    if (localStorage.theme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark')
    // } else if (localStorage.theme === 'light') {
    //   document.documentElement.classList.add('light')
    }
  }, []);
  return (
    <div className="h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white">
      <div className="fixed right-2 top-2 z-50">
        <button onClick={toggleDarkMode}><DarkModeIcon /></button>
      </div>
      <div className="fixed inset-0 flex justify-center top-2">
        <span
          className='inline h-8 text-2xl'
          onMouseEnter={() => setShowUsers(true)}
          onMouseLeave={() => setShowUsers(false)}
        >{groupName}</span>
      </div>
      <div className="fixed left-2 top-2 z-50">
        <button onClick={leaveGroup}><LeftArrow /></button>
      </div>
      <UserList users={users} show={showUsers} />
      <Messages messages={messages} user={messageData.from} />
      <Input onSend={onSend}/>
    </div>
  );
}
