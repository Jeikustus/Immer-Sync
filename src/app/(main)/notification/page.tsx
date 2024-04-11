"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  DocumentData,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "@/config";
import { Button } from "@/components/ui/button";
import { BellRing, CircleX } from "lucide-react";

interface Notification {
  id: string;
  text: string;
  senderName: string;
  createdAt: {
    toDate: () => Date;
  };
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
      for (const doc of querySnapshot.docs) {
        const data = doc.data() as DocumentData;
        const senderName = data.senderName;
        fetchedNotifications.push({
          id: doc.id,
          text: data.text,
          senderName: senderName,
          createdAt: {
            toDate: () => data.createdAt.toDate(),
          },
        });
      }

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
      </div>
    </div>
  );
};

export default NotificationPage;
