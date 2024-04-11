"use client";

import { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { db } from "@/config";

interface Message {
  text: string;
  senderId: string;
  createdAt: Date;
}

const ChatBox: React.FC<{
  currentUserId: string;
  searchedUserId: string;
  onClose: () => void;
}> = ({ currentUserId, searchedUserId, onClose }) => {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!chatRoomId) return;

      const q = query(
        collection(db, "chats", chatRoomId, "messages"), // Adjusted query to directly target the messages subcollection
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
        where("participants", "array-contains", currentUserId) // Use a single where clause for array-contains
      );

      const existingChatSnapshot = await getDocs(existingChatQuery);
      if (!existingChatSnapshot.empty) {
        // Iterate through existing chats to find the matching one
        existingChatSnapshot.forEach((chatDoc) => {
          const participants = chatDoc.data().participants as string[];
          if (participants.includes(searchedUserId)) {
            setChatRoomId(chatDoc.id);
          }
        });
      } else {
        // If no matching chat room found, create a new one
        const newChatRef = firestoreDoc(collection(db, "chats")); // Generate a new document reference within the "chats" collection
        await setDoc(newChatRef, {}); // Create the document without setting data
        setChatRoomId(newChatRef.id); // Obtain the ID from the document reference
        // Now set the document data with the obtained ID
        await setDoc(newChatRef, {
          participants: [currentUserId, searchedUserId],
          createdAt: new Date(),
        });
      }
    };

    checkChatRoom();
  }, [currentUserId, searchedUserId]);

  const handleSendMessage = async () => {
    if (!chatRoomId) return;

    const chatRef = collection(db, "chats", chatRoomId, "messages");

    await addDoc(chatRef, {
      text: newMessage,
      senderId: currentUserId,
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
          Send
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
