"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import ChatBox from "../chat/chat";
import { Button } from "@/components/ui/button";
import { useAuthState } from "react-firebase-hooks/auth";

interface UserData {
  name: string;
  email: string;
}

const FindJobPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [authorUID, setAuthorUID] = useState<string>("");
  const [showChatBox, setShowChatBox] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobCollection = collection(db, "jobs");
        const querySnapshot = await getDocs(jobCollection);
        const jobsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  const handleMessage = async (authorUID: string): Promise<void> => {
    setAuthorUID(authorUID);
    setShowChatBox(true);
    setLoading(true); // Reset loading state
    setUserData(null); // Reset user data

    try {
      const userDoc = await getDoc(doc(db, "users", authorUID));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error fetching author's data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = (): void => {
    setShowChatBox(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-screen overflow-y-auto">
      <h1 className="text-3xl font-semibold mb-4">Find Job</h1>
      <div className="grid gap-8 scrollbar-hide">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{job.jobTitle}</h2>
              <p className="text-gray-600 mb-2">Category: {job.category}</p>
              <p className="text-gray-600 mb-2">
                Description: {job.jobDescription}
              </p>
              <p className="text-gray-600 mb-2">Author: {job.author}</p>
              <p className="text-gray-600 mb-2">
                Organization: {job.organizationName}
              </p>
              <p className="text-gray-600">
                Created At: {new Date(job.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="m-4 flex justify-end">
              <Button
                onClick={() => handleMessage(job.authorUID)}
                className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
              >
                Message & Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
      {showChatBox && authorUID && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50">
          <ChatBox
            currentUserName={
              loading ? "Loading..." : userData?.name || "No Name"
            }
            currentUserId={user ? user.uid : null}
            searchedUserId={authorUID}
            onClose={handleCloseModal}
            recipientUserId={authorUID}
            recipientUserName={"Author"}
          />
        </div>
      )}
    </div>
  );
};

export default FindJobPage;
