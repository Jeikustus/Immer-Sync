import { 
  signInWithEmailAndPassword as signInWithEmailAndPasswordFirebase,
  createUserWithEmailAndPassword as createUserWithEmailAndPasswordFirebase,
  sendPasswordResetEmail as sendPasswordResetEmailFirebase,
  signOut as signOutFirebase,
} from "firebase/auth";

import {
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebaseConfig";

interface UserData {
  uid: string;
  name: string;
  email: string;
  authProvider: string;
  accountType: string;
}

// Function to create a user with email and password and save user data to Firestore
export const createUserWithEmailAndPassword = async (email: string, password: string, name: string, accountType: string) => {
  try {
    const userCredential = await createUserWithEmailAndPasswordFirebase(auth, email, password);
    const { uid } = userCredential.user;

    const userData: UserData = {
      uid,
      name,
      email,
      authProvider: "local",
      accountType,
    };

    await addDoc(collection(db, "users"), userData);

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Function to reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmailFirebase(auth, email);
    return true; // Password reset email sent successfully
  } catch (error) {
    throw error;
  }
};

// Function to sign in with email and password
export const signInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPasswordFirebase(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
