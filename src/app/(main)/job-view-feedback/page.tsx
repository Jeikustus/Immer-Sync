"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/config";

interface Comment {
  id: string;
  jobId: string;
  text: string;
  userName: string;
  jobTitle: string;
}

const JobViewFeedback: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsCollection = collection(db, "job-comments");
        const q = query(commentsCollection);
        const querySnapshot = await getDocs(q);
        const commentsData: Comment[] = [];

        for (const commentDoc of querySnapshot.docs) {
          const commentData = commentDoc.data() as Comment;
          const jobId = commentData.jobId;
          const jobDocRef = doc(db, "job-applications", jobId);
          const jobDocSnap = await getDoc(jobDocRef);
          if (jobDocSnap.exists()) {
            const jobData = jobDocSnap.data() as { jobTitle: string };
            commentsData.push({
              ...commentData,
              jobTitle: jobData.jobTitle,
            });
          }
        }

        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold mb-6">Feedback</h1>
      <ul className="divide-y divide-gray-300">
        {comments.map((comment) => (
          <li key={comment.id} className="py-4">
            <div>
              <p className="text-lg font-semibold">{comment.jobTitle}</p>
              <p className="text-gray-700">{comment.text}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">User: {comment.userName}</p>
              <p className="text-sm text-gray-500">Job ID: {comment.jobId}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobViewFeedback;
