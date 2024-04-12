"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState } from "react-firebase-hooks/auth";
import dynamic from "next/dynamic";

// Dynamically import ChatBox component
const ChatBox = dynamic(() => import("./chat"));

interface User {
  uid: string;
  name: string;
  email: string;
  accountType: string;
  displayName: string;
}
interface UserData {
  name: string;
  email: string;
  accountType: string;
  gradeLevel: string;
}

const ChatPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showChatBox, setShowChatBox] = useState<boolean>(false);
  const [user] = useAuthState(auth);
  const [recipientUserId, setRecipientUserId] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatRoomsData, setChatRoomsData] = useState<any[]>([]);

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
        const loggedInUserEmail = `${user ? user.email : null}`;

        if (loggedInUserEmail) {
          const usersCollection = collection(db, "users");
          const q = query(
            usersCollection,
            where("email", "==", loggedInUserEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data() as UserData;
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

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        if (!user) return;

        const userChatRoomsRef = collection(db, "chats");
        const q = query(
          userChatRoomsRef,
          where("participants", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const chatRoomsDataArray: any[] = [];
        querySnapshot.forEach((doc) => {
          const chatRoomData = doc.data();
          chatRoomsDataArray.push({ id: doc.id, ...chatRoomData });
        });

        setChatRoomsData(chatRoomsDataArray);
      } catch (error) {
        console.error("Error fetching user chat rooms:", error);
      }
    };

    fetchChatRooms();
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
        <div>
          {chatRoomsData.map((chatRoom: any) => (
            <div key={chatRoom.id} className="border-b border-gray-300 py-2">
              <p className="text-lg font-semibold">{chatRoom.recipientName}</p>
              <Button onClick={() => handleMessage(chatRoom.recipientId)}>
                Message
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
