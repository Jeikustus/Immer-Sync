"use client";

import { useState, useEffect, useRef } from "react";
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
import { db, storage } from "@/config";
import {
  CircleUserRound,
  CircleX,
  Paperclip,
  Send,
  File,
  FileCheck2,
} from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface Message {
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
  attachmentURL?: string;
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
  const [attachment, setAttachment] = useState<File | null>(null);

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
      let foundChatRoomId = null;

      if (!existingChatSnapshot.empty) {
        existingChatSnapshot.forEach((chatDoc) => {
          const participants = chatDoc.data().participants as string[];
          if (participants.includes(searchedUserId)) {
            foundChatRoomId = chatDoc.id;
          }
        });
      }

      if (!foundChatRoomId) {
        // Create a new chat room
        const newChatRef = firestoreDoc(collection(db, "chats"));
        await setDoc(newChatRef, {
          participants: [currentUserId, searchedUserId],
          createdAt: new Date(),
        });
        foundChatRoomId = newChatRef.id;
      }

      setChatRoomId(foundChatRoomId);
    };

    checkChatRoom();
  }, [currentUserId, searchedUserId]);

  const handleSendMessage = async () => {
    if (!chatRoomId || !currentUserId) return;

    try {
      if (attachment) {
        // Uploading attachment
        const storageRef = ref(storage, attachment.name);
        const uploadTask = uploadBytesResumable(storageRef, attachment);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Handle progress
          },
          (error) => {
            // Handle errors
            console.error("Error uploading file:", error);
          },
          async () => {
            // Upload completed successfully, now get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Add message to the chat messages collection
            const chatRef = collection(db, "chats", chatRoomId, "messages");
            await addDoc(chatRef, {
              senderId: currentUserId,
              senderName: currentUserName,
              recipientUserName: recipientUserName,
              createdAt: new Date(),
              attachmentURL: downloadURL,
            });

            const notificationRef = collection(
              db,
              "notifications",
              recipientUserId,
              "messages"
            );
            await addDoc(notificationRef, {
              senderName: currentUserName,
              createdAt: new Date(),
              attachmentURL: downloadURL,
            });

            setAttachment(null);
          }
        );
      }

      if (newMessage.trim() !== "") {
        // Add text-only message to the chat messages collection
        const chatRef = collection(db, "chats", chatRoomId, "messages");
        await addDoc(chatRef, {
          text: newMessage,
          senderId: currentUserId,
          senderName: currentUserName,
          recipientUserName: recipientUserName,
          createdAt: new Date(),
        });

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
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getAttachmentType = (attachmentURL: string): string => {
    const extension = attachmentURL.split(".").pop()?.toUpperCase();
    switch (extension) {
      case "PNG":
        return "Attachment (PNG)";
      case "PDF":
        return "Attachment (PDF)";
      case "DOC":
      case "DOCX":
        return "Attachment (Word Document)";
      case "XLS":
      case "XLSX":
        return "Attachment (Excel Sheet)";
      default:
        return "Attachment";
    }
  };

  const handleCloseChat = () => {
    onClose();
  };

  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setAttachment(file);
  };

  return (
    <div className="fixed bottom-0 right-0 m-4 w-96 bg-white border border-gray-300 rounded-lg shadow-md">
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
            <p className="text-[10px] text-gray-500">
              {message.senderId === currentUserId ? "You" : recipientUserName}
            </p>
            {message.attachmentURL ? (
              <a
                href={message.attachmentURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-blue-100 rounded-lg p-2"
              >
                <button className="flex items-center bg-blue-100 rounded-lg p-2">
                  <FileCheck2 />
                  <span className="text-xs text-gray-400 ml-1">
                    ({getAttachmentType(message.attachmentURL)})
                  </span>
                </button>
              </a>
            ) : (
              <p
                className={`inline-block px-3 py-1 rounded-lg text-sm ${
                  message.senderId === currentUserId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 py-2 flex items-center">
        <input
          type="text"
          placeholder="Type a message"
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <input
          id="file-upload"
          type="file"
          onChange={handleAttachFile}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <button
          onClick={() => document.getElementById("file-upload")?.click()}
          className={`text-black px-4 py-1 rounded-lg hover:text-gray-500 focus:outline-none focus:ring focus:border-blue-500 ${
            attachment ? "bg-green-500" : ""
          }`}
        >
          <Paperclip />
        </button>
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-500"
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
