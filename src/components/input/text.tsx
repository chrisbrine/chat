'use client';
import { useRef, useState, useEffect, useCallback } from "react";
// import EmojiSelector from "./emoji";
import emojiData from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { EMessageType } from "../../data/messages";

export default function TextInput({
  sendContent,
}: Readonly<{
  sendContent: (type: EMessageType, content: any) => void,
}>) {
  // include an emoji button for adding emojis to the text input and allow multi lines
  // should use textarea as well
  const [message, setMessage] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const text = useCallback((content: string) => {
    sendContent(EMessageType.Text, content);
    setMessage("");
  }, [sendContent]);
  const closeEmoji = () => {
    if (openEmoji) {
      setOpenEmoji(false);
    }
  }
  const addEmoji = (emoji: string) => {
    const current = textarea.current;
    if (!current) {
      return;
    }
    const position = current.selectionStart || 0;

    const before = current.value.substring(0, position);
    const after = current.value.substring(position, current.value.length);

    const newValue = before + emoji + after;
    current.value = newValue;
    setMessage(newValue);

    current.selectionStart = current.selectionEnd = position + emoji.length;
    current.focus()
    closeEmoji();
  };
  useEffect(() => {
    function keyEnter() {
      const current = textarea.current;
      if (!current) {
        return;
      }
      const position = current.selectionStart || 0;
      const before = current.value.substring(0, position - 1);
      const after = current.value.substring(position, current.value.length);
      text(before + after);
    }

    const current = textarea.current;
    if (!current) {
      return;
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "CapsLock") {
        setCapsLock(!capsLock);
      } else if (e.key === "Enter" && !e.shiftKey) {
        keyEnter();
      } else {
        setMessage(current.value);
      }
    };
    current.addEventListener("keyup", onKeyUp);
    return () => {
      current.removeEventListener("keyup", onKeyUp);
    };
  }, [capsLock, text]);
  return (
    <div className="flex flex-col" style={{position: "relative"}}>
      <div className="flex flex-row bg-slate-300">
        <button
          className="bg-slate-500 text-white p-2 hover:bg-blue-600 active:bg-blue-700"
          onClick={() => setOpenEmoji(true)}>😀
        </button>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, display: openEmoji ? 'block' : 'none'}}>
        <Picker data={emojiData} onEmojiSelect={(emoji: any) => addEmoji(emoji.native)} onClickOutside={closeEmoji} />
      </div>
      <textarea
        ref={textarea}
        className="border-2 border-gray-400 text-black p-2 resize-none bg-slate-100 outline-none"
        onInput={(e) => setMessage(e.currentTarget.value)}
        value={message}
      />
      <button
        className="bg-blue-500 text-white p-2 hover:bg-blue-600 active:bg-blue-700"
        onClick={() => text(message)}
      >
        Send
      </button>
    </div>
  );
}