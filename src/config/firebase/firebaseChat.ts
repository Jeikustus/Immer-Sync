import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const sendDirectMessage = async (fromUid: string, toUid: string, text: string, photoURL: string | null) => {
  try {
    const chatRoomId = generateChatRoomId(fromUid, toUid); // Generate a unique chat room ID
    const chatRef = collection(db, "chats", chatRoomId, "messages"); // Reference to the chat room's messages collection
    await addDoc(chatRef, {
      text,
      fromUid,
      toUid,
      photoURL,
      createdAt: serverTimestamp(),
    });
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Function to generate a chat room ID based on the two user IDs
const generateChatRoomId = (uid1: string, uid2: string): string => {
  // Sort the user IDs alphabetically and concatenate them to create a unique ID
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};
