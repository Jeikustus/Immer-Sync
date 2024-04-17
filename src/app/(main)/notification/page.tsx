"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  DocumentData,
  deleteDoc,
  doc,
  where,
} from "firebase/firestore";
import { db, auth } from "@/config";
import { Button } from "@/components/ui/button";
import { BellRing, BriefcaseBusiness, CircleX, Send } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

interface Notification {
  id: string;
  text: string;
  senderName: string;
}

interface JobNotification {
  id: string;
  text: string;
  senderName: string;
}

interface UserData {
  name: string;
  email: string;
  accountType: string;
  gradeLevel?: string;
  teacherGrade?: string;
  organizationName?: string;
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobNotifications, setJobNotifications] = useState<JobNotification[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentAccountType, setCurrentAccountType] =
    useState<string>("Loading...");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUserEmail = user ? user.email : null;

        if (loggedInUserEmail) {
          const usersCollection = collection(db, "users");
          const q = query(
            usersCollection,
            where("email", "==", loggedInUserEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data() as UserData;
            console.log("Fetched user data:", userData);
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchNotifications(user.uid);
        fetchJobNotifications();
      } else {
        console.log("USER NOT FOUND");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentAccountType = loading
      ? "Loading..."
      : userData?.accountType || "No Account Type";
    setCurrentAccountType(currentAccountType);
  }, [userData, loading]);

  const fetchNotifications = async (userId: string) => {
    try {
      const q = query(collection(db, "notifications", userId, "messages"));
      const querySnapshot = await getDocs(q);

      const fetchedNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const senderName = data.senderName;
        fetchedNotifications.push({
          id: doc.id,
          text: data.text,
          senderName: senderName,
        });
      });

      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchJobNotifications = async () => {
    try {
      const jobNotificationsQ = query(collection(db, "job-notifications"));
      const querySnapshot = await getDocs(jobNotificationsQ);

      const fetchedNotifications: JobNotification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        fetchedNotifications.push({
          id: doc.id,
          text: data.jobTitle,
          senderName: `Posted By: ${data.author}`,
        });
      });

      setJobNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error fetching job notifications:", error);
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
    <div className="flex justify-center items-center p-10">
      <div className="grid grid-cols-5 gap-5 grid-rows-9">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg">
              <BellRing />
            </div>
            <div className="ms-3">
              <div className="text-md font-bold">{notification.senderName}</div>
              <div className="text-sm">
                <em>{notification.text}</em>
              </div>
            </div>
            <button
              onClick={() => deleteNotification(notification.id)}
              type="button"
              className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
              aria-label="Close"
            >
              <CircleX />
            </button>
          </div>
        ))}
        {currentAccountType !== "Student" &&
          currentAccountType !== "Organization" &&
          jobNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow"
              role="alert"
            >
              <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-blue-100 rounded-lg">
                <BriefcaseBusiness />
              </div>
              <div className="ms-3">
                <div className="text-md font-bold">{notification.text}</div>
                <div className="text-sm">
                  <em>{notification.senderName}</em>
                </div>
              </div>
              <button
                onClick={() => {
                  window.location.href = "/find-job";
                }}
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-white text-blue-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8
              w-8"
                aria-label="Close"
              >
                <Send />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NotificationPage;
