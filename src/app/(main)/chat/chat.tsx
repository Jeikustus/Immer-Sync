"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc as firestoreDoc,
  setDoc,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/config";
import { CircleUserRound, CircleX, Send } from "lucide-react";

interface Message {
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
}

const ChatBox: React.FC<{
  currentUserName: string | null;
  currentUserId: string | null;
  searchedUserId: string;
  onClose: () => void;
  recipientUserId: string;
  recipientUserName: string;
}> = ({
  currentUserName,
  currentUserId,
  searchedUserId,
  onClose,
  recipientUserId,
  recipientUserName,
}) => {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!chatRoomId) return;

      const q = query(
        collection(db, "chats", chatRoomId, "messages"),
        orderBy("createdAt")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          messages.push(doc.data() as Message);
        });
        setChatHistory(messages);
      });

      return () => unsubscribe();
    };

    fetchChatHistory();
  }, [chatRoomId]);

  useEffect(() => {
    const checkChatRoom = async () => {
      const existingChatQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUserId)
      );

      const existingChatSnapshot = await getDocs(existingChatQuery);
      if (!existingChatSnapshot.empty) {
        existingChatSnapshot.forEach((chatDoc) => {
          const participants = chatDoc.data().participants as string[];
          if (participants.includes(searchedUserId)) {
            setChatRoomId(chatDoc.id);
          }
        });
      } else {
        const newChatRef = firestoreDoc(collection(db, "chats"));
        await setDoc(newChatRef, {});
        setChatRoomId(newChatRef.id);
        await setDoc(newChatRef, {
          participants: [currentUserId, searchedUserId],
          createdAt: new Date(),
        });
      }
    };

    checkChatRoom();
  }, [currentUserId, searchedUserId]);

  const handleSendMessage = async () => {
    if (!chatRoomId || !currentUserId) return;

    // Add message to the chat messages collection
    const chatRef = collection(db, "chats", chatRoomId, "messages");
    await addDoc(chatRef, {
      text: newMessage,
      senderId: currentUserId,
      senderName: currentUserName,
      createdAt: new Date(),
    });

    // Add message to the recipient's notification collection
    const notificationRef = collection(
      db,
      "notifications",
      recipientUserId,
      "messages"
    );
    await addDoc(notificationRef, {
      text: newMessage,
      senderName: currentUserName,
      createdAt: new Date(),
    });

    setNewMessage("");
  };

  const handleCloseChat = () => {
    onClose();
  };

  return (
    <div className="fixed bottom-0 right-0 m-4 w-96 bg-white border border-gray-300 rounded-lg shadow-md">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <CircleUserRound className="w-6 h-6 text-blue-500" />
          <p className="text-lg font-semibold">{recipientUserName}</p>
        </div>
        <button onClick={handleCloseChat}>
          <CircleX className="w-6 h-6 text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      <div className="h-64 overflow-y-auto px-4 py-2">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              message.senderId === currentUserId ? "items-end" : "items-start"
            } mb-2`}
          >
            {message.senderId === currentUserId && (
              <p className="text-[10px] text-gray-500">You</p>
            )}
            {message.senderId !== currentUserId && (
              <p className="text-[10px] text-gray-500">
                {recipientUserName || "Unknown"}
              </p>
            )}
            <p
              className={`inline-block px-3 py-1 rounded-lg text-sm ${
                message.senderId === currentUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border border-gray-300 rounded-lg px-3 py-1 mr-2 focus:outline-none focus:ring focus:border-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
