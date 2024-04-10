"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  orderBy,
  limit,
  query,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, sendMessage } from "@/config";
import Image from "next/image";

interface Message {
  id: string;
  text: string;
  uid: string;
  photoURL: string;
  createdAt: any;
}

function ChatRoom() {
  const dummy = useRef<HTMLDivElement>(null);
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));

  const [messages, setMessages] = useState<Message[]>([]);

  // Listen to changes in messages collection
  useEffect(() => {
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: Message[] = [];
      querySnapshot.forEach((doc) => {
        // Ensure doc.id matches the type expected by Message interface
        data.push({ ...doc.data(), id: doc.id } as Message);
      });
      setMessages(data);
      if (dummy.current) dummy.current.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [q]);

  const [formValue, setFormValue] = useState<string>("");
  const currentUser = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const { uid, photoURL } = currentUser;

    await sendMessage(formValue, uid, photoURL);

    setFormValue("");
    if (dummy.current) dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-grow overflow-y-auto">
        {messages.map((msg: Message) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={dummy}></div>
      </main>
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-between p-4"
      >
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something nice"
          className="flex-grow px-4 py-2 mr-4 border border-gray-300 rounded-lg focus:outline-none"
        />
        <button
          type="submit"
          disabled={!formValue}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          🕊️
        </button>
      </form>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const { text, uid, photoURL } = message;
  const currentUser = auth.currentUser;

  const messageClass = uid === currentUser?.uid ? "sent" : "received";

  return (
    <div
      className={`flex items-center justify-${
        messageClass === "sent" ? "end" : "start"
      } p-4`}
    >
      <Image
        src={photoURL || "/logo.png"}
        alt="User Avatar"
        width={50}
        height={50}
        priority
        className="w-12 h-12 rounded-full"
      />
      <p
        className={`ml-4 px-4 py-2 bg-gray-200 rounded-lg ${
          messageClass === "sent"
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export default ChatRoom;
