'use client';
import { useState } from "react";
import { EMessageType } from "../../data/messages";
import Text from "./text";

export default function MessageInput({
  onSend,
}: Readonly<{
  onSend: (type: EMessageType, content: any) => void,
}>) {
  const [messageType, setMessageType] = useState<EMessageType>(EMessageType.Text);
  const sendContent = (type: EMessageType, content: any) => {
    onSend(type, content);
  }
  const ButtonType = ({ type, text, selected, current }: Readonly<{
    type: EMessageType,
    text: string,
    selected: (type: EMessageType) => void,
    current: EMessageType,
  }>) => {
    const classSelected = "border-slate-300 bg-slate-300 text-black";
    const classUnselected = "border-slate-700 bg-slate-700 text-white hover:bg-slate-600";

    return (
      <button
        onClick={() => current !== type && selected(type)}
        className={`w-1/4 border-2 ${current === type ? classSelected : classUnselected}`}
      >
        {text}
      </button>
    );
  }

  // include an emoji button, and a send button (the emoji button should show emojis to add)
  return (
    <div className="w-full h-auto">
      <div className="flex flex-row flex-wrap items-around justify-around bg-slate-100 dark:bg-slate-500">
        <ButtonType type={EMessageType.Text} text="Text" selected={setMessageType} current={messageType} />
        {/* <button onClick={() => setMessageType(EMessageType.Image)}>Image</button>
        <button onClick={() => setMessageType(EMessageType.Video)}>Video</button>
        <button onClick={() => setMessageType(EMessageType.Audio)}>Audio</button> */}
      </div>
      <div>
        {messageType === EMessageType.Text && (
          <Text
            sendContent={sendContent}
          />
        )}
      </div>
    </div>
  );
}