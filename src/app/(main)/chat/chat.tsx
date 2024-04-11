import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { db } from "@/config";

interface Message {
  text: string;
  senderEmail: string; // Change senderId to senderEmail
  createdAt: Date;
}

const ChatBox: React.FC<{
  currentUserEmail: string; // Change currentUserUid to currentUserEmail
  searchedUserEmail: string; // Change searchedUserUid to searchedUserEmail
  onClose: () => void;
}> = ({ currentUserEmail, searchedUserEmail, onClose }) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    const fetchChatHistory = async () => {
      const chatRoomId = generateChatRoomId(
        currentUserEmail,
        searchedUserEmail
      ); // Update to use email
      const q = query(
        collection(db, "chats", chatRoomId, "messages"),
        orderBy("createdAt")
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages: Message[] = [];
          snapshot.forEach((doc) => {
            messages.push(doc.data() as Message);
          });
          setChatHistory(messages);
        },
        (error) => {
          console.error("Error fetching chat history:", error);
        }
      );
      return () => unsubscribe();
    };

    fetchChatHistory();
  }, [currentUserEmail, searchedUserEmail]);

  const handleSendMessage = () => {
    const chatRoomId = generateChatRoomId(currentUserEmail, searchedUserEmail); // Update to use email
    const chatRef = collection(db, "chats", chatRoomId, "messages");
    addDoc(chatRef, {
      text: newMessage,
      senderEmail: currentUserEmail, // Change senderId to senderEmail
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
              message.senderEmail === currentUserEmail
                ? "text-right mb-2"
                : "mb-2"
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

// Function to generate a chat room ID based on the two user emails
const generateChatRoomId = (email1: string, email2: string): string => {
  return email1 < email2 ? `${email1}_${email2}` : `${email2}_${email1}`;
};
