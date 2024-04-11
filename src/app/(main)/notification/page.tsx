"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  DocumentData,
  getDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "@/config";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="text-gray-300">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id} className="mb-4">
            <p className="text-lg font-semibold">{notification.text}</p>
            <p>Sent by: {notification.senderName}</p>{" "}
            <p className="text-sm">
              Created at: {notification.createdAt.toDate().toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPage;
