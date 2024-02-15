import { Message } from "../../data/messages";
// import { User } from "../../data/users";

export default function MessageList({ messages, user }: { messages: Message[], user: {name: string, id: string} }) {
  let lastID = '';
  let currentID = '';
  let nextID = '';
  messages = messages.sort((a, b) => b.timestamp - a.timestamp);
  return (
    <div className="overflow-auto h-full pt-8">
      {messages && messages.length === 0 && (
        <div className="text-center text-gray-400">
          No messages yet
        </div>
      )}
      {messages && messages.map((message, index) => {
        lastID = currentID;
        currentID = message.from.id;
        nextID = messages[index + 1]?.from.id;
        return (
        <div
          key={message.id}
          className={`px-1 block ${message.from.id === user.id ? "ml-16 text-right" : "mr-16 text-left"}`}
        >
          <div className={`text-xs px-1 ${lastID === currentID ? 'hidden' : ''}`}>
            {message.from.name}
          </div>
          <div
            className={`p-2 rounded-lg text-white inline-block text-left ${message.from.id === user.id ? "bg-blue-600" : "bg-slate-700"}`}
          >
            {message.content}
          </div>
          <div className={`text-xs px-1 block ${currentID === nextID ? 'hidden' : ''}`}>
            {(new Date(message.timestamp)).toLocaleString()}
          </div>
        </div>
        );
      })}
    </div>
  );
}
