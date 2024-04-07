import { db, auth } from "./firebaseConfig";
import { collection, getDocs, QuerySnapshot, DocumentData, where, query } from "firebase/firestore";

interface UserData {
  uid: string;
  name: string;
  email: string;
  authProvider: string;
  accountType: string;
}

// Function to fetch all users' data
export const fetchAllUsersData = async (): Promise<UserData[]> => {
  try {
    const usersData: UserData[] = [];
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "users"));

    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserData;
      usersData.push(userData);
    });

    return usersData;
  } catch (error) {
    throw error;
  }
};

// Function to check the account type of a user
export const checkAccountType = async (userId: string): Promise<string | null> => {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // User not found
    }

    const userData = querySnapshot.docs[0].data() as UserData;
    return userData.accountType;
  } catch (error) {
    throw error;
  }
};

// Function to log out the user
export const logoutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    throw error;
  }
};
