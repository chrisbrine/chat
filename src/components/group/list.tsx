import { Groups } from "../../data/groups";
import { useState, useEffect } from "react";
import { SocketIO } from "../../data/socket";
import { get } from "http";

export default function GroupList({
  onSelect,
  socket,
}: Readonly<{
  onSelect: (groupName: string) => void,
  socket: SocketIO,
}>) {
  const [groups, setGroups] = useState<Groups>(new Groups());
  const [groupId, setGroupId] = useState<any>(null);

  useEffect(() => {
    socket.on('groups', 'main', (newGroups: [string, number][]) => {
      setGroups(new Groups(newGroups));
    });
  
    function getGroups() {
      socket.emit('groups', {});
      setGroupId(setTimeout(getGroups, 10000))
    }

    getGroups();

    return () => {
      clearTimeout(groupId);
      socket.off('groups');
    }
  }, []);

  return (
    <div>
      <div className="text-2xl font-bold flex flex-row justify-between py-2 px-4 m-2">
        <div>Group Name</div>
        <div># of Users</div>
      </div>
      {groups && groups?.groups.map((group) => (
        <div
          key={group.name}
          onClick={() => onSelect(group.name)}
          className="m-2 bg-slate-400 py-2 px-4 rounded-lg flex flex-row justify-between hover:bg-slate-500 cursor-pointer"
        >
          <div>
            {group.name}
          </div>
          <div>
            {group.userCount}
          </div>
        </div>
      ))}
    </div>
  );
}