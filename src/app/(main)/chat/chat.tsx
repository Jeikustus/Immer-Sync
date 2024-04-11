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
}> = ({
  currentUserName,
  currentUserId,
  searchedUserId,
  onClose,
  recipientUserId,
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
      <div className="h-64 overflow-y-auto px-4 py-2">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={
              message.senderId === currentUserId ? "text-right mb-2" : "mb-2"
            }
          >
            <p className="inline-block bg-gray-200 px-2 py-1 rounded-lg">
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
          className="flex-grow border border-gray-300 rounded-lg px-2 py-1 mr-2"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
        >
          Send Message
        </button>
        <button
          onClick={handleCloseChat}
          className="bg-gray-300 text-gray-800 ml-2 px-4 py-1 rounded-lg hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
