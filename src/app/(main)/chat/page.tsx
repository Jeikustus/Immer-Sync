"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "@/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState } from "react-firebase-hooks/auth";
import dynamic from "next/dynamic";
import { User } from "./types";
import { BellRing, CircleUserRound, CircleX } from "lucide-react";
import Image from "next/image";

// Dynamically import ChatBox component
const ChatBox = dynamic(() => import("./chat"));

interface Notification {
  id: string;
  text: string;
  senderName: string;
  senderEmail: string;
}

const ChatPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showChatBox, setShowChatBox] = useState<boolean>(false);
  const [user] = useAuthState(auth);
  const [recipientUserId, setRecipientUserId] = useState<string>("");
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleSearch = async (): Promise<void> => {
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", searchTerm)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as User;
        setSearchedUser(userData);
        setIsModalOpen(true);
      } else {
        alert("User not found");
      }
    } catch (error) {
      console.error("Error searching for user:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUserEmail = user?.email;

        if (loggedInUserEmail) {
          const usersCollection = collection(db, "users");
          const q = query(
            usersCollection,
            where("email", "==", loggedInUserEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data() as User;
            setUserData(userData);
          } else {
            console.warn("No user found with the provided email");
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleMessage = (recipientId: string): void => {
    setRecipientUserId(recipientId);
    setShowChatBox(true);
    setIsModalOpen(false);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSearchedUser(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchNotifications(user.uid);
      } else {
        console.log("USER NOT FOUND");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const q = query(collection(db, "notifications", userId, "messages"));
      const querySnapshot = await getDocs(q);

      const fetchedNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const senderName = data.senderName;
        const senderEmail = data.senderEmail; // Fetch senderEmail
        fetchedNotifications.push({
          id: doc.id,
          text: data.text,
          senderName: senderName,
          senderEmail: senderEmail, // Include senderEmail in the notification object
        });
      });

      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(
          doc(db, "notifications", currentUser.uid, "messages", id)
        );
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id !== id)
        );
      } else {
        console.error("Current user not found");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CHAT PAGE</h1>
      <div className="flex mb-4">
        <Input
          type="text"
          placeholder="Search by Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow mr-2"
        />
        <Button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Search
        </Button>
      </div>
      <div>
        {showChatBox && searchedUser && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50">
            <ChatBox
              currentUserName={
                loading ? "Loading..." : userData?.name || "No Name"
              }
              currentUserId={user ? user.uid : null}
              searchedUserId={searchedUser.uid}
              onClose={handleCloseModal}
              recipientUserId={recipientUserId}
              recipientUserName={searchedUser.name}
              recipientEmail={searchedUser.email}
            />
          </div>
        )}

        {isModalOpen && searchedUser && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2">
                Searched User Details
              </h2>
              <p>Name: {searchedUser.name}</p>
              <p>Email: {searchedUser.email}</p>
              <p>Account Type: {searchedUser.accountType}</p>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleMessage(searchedUser.uid)}
                  className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                >
                  Message
                </Button>
                <Button
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start w-full p-4 text-gray-700 bg-white border-b border-gray-200"
            role="alert"
          >
            <div className="flex-shrink-0 w-10 h-10">
              <CircleUserRound />
            </div>
            <div className="flex flex-col justify-between flex-grow ml-4">
              <div>
                <span className="font-medium">{notification.senderName}</span>{" "}
              </div>
              <p className="text-sm">{notification.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;
