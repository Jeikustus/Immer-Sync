"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "@/config";
import { useAuthState } from "react-firebase-hooks/auth";

interface Job {
  id: string;
  jobTitle: string;
  studentEmails: string[];
  teacherEmail: string;
}

interface Comment {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

const FeedbackPage: React.FC = () => {
  const [appliedJob, setAppliedJob] = useState<Job | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchAppliedJob = async () => {
      try {
        if (user?.email) {
          const q = query(
            collection(db, "job-applications"),
            where("studentEmails", "array-contains", user.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setAppliedJob({ id: doc.id, ...doc.data() } as Job);
          } else {
            setAppliedJob(null);
          }
        }
      } catch (error) {
        console.error("Error fetching applied job:", error);
      }
    };

    const fetchComments = async () => {
      try {
        if (appliedJob) {
          const q = query(
            collection(db, "job-comments"),
            where("jobId", "==", appliedJob.id)
          );
          const querySnapshot = await getDocs(q);
          const fetchedComments: Comment[] = [];
          querySnapshot.forEach((doc) => {
            fetchedComments.push({ id: doc.id, ...doc.data() } as Comment);
          });
          setComments(fetchedComments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchAppliedJob();
    fetchComments();
  }, [user, appliedJob]);

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!user || !appliedJob) return;
      const comment: Omit<Comment, "id" | "createdAt"> = {
        jobId: appliedJob.id,
        userId: user.uid,
        userName: user.email || "Anonymous",
        text: commentText,
      };
      await addDoc(collection(db, "job-comments"), {
        ...comment,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
      // Refetch comments after adding a new one
      const q = query(
        collection(db, "job-comments"),
        where("jobId", "==", appliedJob.id)
      );
      const querySnapshot = await getDocs(q);
      const fetchedComments: Comment[] = [];
      querySnapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Feedback page</h1>
      {appliedJob ? (
        <div className="bg-white shadow-md rounded-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Job Title: {appliedJob.jobTitle}
          </h2>
          <p className="text-gray-600 mb-2">
            Applied By: {appliedJob.teacherEmail}
          </p>
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <ul className="space-y-2">
            {comments.map((comment) => (
              <li key={comment.id} className="text-gray-600">
                <span className="font-semibold">{comment.userName}: </span>
                {comment.text}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmitComment} className="mt-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your comment..."
              className="w-full p-2 border rounded-md"
              required
            ></textarea>
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Add Comment
            </button>
          </form>
        </div>
      ) : (
        <p className="text-red-500">
          No job application found for the current user.
        </p>
      )}
    </div>
  );
};

export default FeedbackPage;
