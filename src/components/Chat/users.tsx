import { useState } from "react";
// import { Users as UsersType} from "../../data/users";

export default function Users({
  users,
  show,
}: { users: {name: string, id: string}[], show: boolean }) {
  const [mouseOver, setMouseOver] = useState(false);
  return (
    <div>
      {(show || mouseOver) && users && (
        <div
          className="fixed top-0 min-w-36 min-h-36 bg-slate-400 z-40"
          style={{left: '50%', transform: "translateX(-50%)"}}
          onMouseOver={() => setMouseOver(true)}
          onMouseOut={() => setMouseOver(false)}
        >
          <h3 className="text-center bg-slate-300">Users</h3>
          <ul>
            {users && users.length && users.map(user => (
              <li
                className="hover:bg-slate-300 text-white hover:text-black text-center cursor-pointer"
                key={user.id}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}