import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const sendMessage = async (text: string, uid: string, photoURL: string | null) => {
  try {
    const messagesRef = collection(db, "messages"); 
    await addDoc(messagesRef, {
      text,
      uid,
      photoURL,
      createdAt: serverTimestamp(),
    });
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
