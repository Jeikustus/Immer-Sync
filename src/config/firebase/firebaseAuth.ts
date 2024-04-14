import { 
  signInWithEmailAndPassword as signInWithEmailAndPasswordFirebase,
  createUserWithEmailAndPassword as createUserWithEmailAndPasswordFirebase,
  sendPasswordResetEmail as sendPasswordResetEmailFirebase,
  deleteUser,
} from "firebase/auth";

import {
  collection,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

interface UserData {
  uid: string;
  name: string;
  email: string;
  authProvider: string;
  accountType: string;
  gradeLevel?: string; 
  teacherGrade?: string; 
  organizationName?: string; 
}

// Function to create a user with email and password and save user data to Firestore
export const createUserWithEmailAndPassword = async (email: string, password: string, name: string, additionalInfo: string, accountType: string) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPasswordFirebase(auth, email, password);
    const { uid } = userCredential.user;

    // Create user data for Firestore
    const userData: UserData = {
      uid,
      name,
      email,
      authProvider: "local",
      accountType: "pending",
    };

    // Set additional info based on accountType
    if (accountType === "student") {
      userData.gradeLevel = additionalInfo;
    } else if (accountType === "teacher") {
      userData.teacherGrade = additionalInfo;
    } else if (accountType === "organization") {
      userData.organizationName = additionalInfo;
    }

    // Add user data to Firestore
    await addDoc(collection(db, "users"), userData);

    return userCredential.user;
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

// Function to reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmailFirebase(auth, email);
    return true; // Password reset email sent successfully
  } catch (error) {
    throw error;
  }
};


