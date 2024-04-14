"use client";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import { useAuthState } from "react-firebase-hooks/auth";

interface JobApplication {
  jobTitle: string;

  teacherEmail: string;
  studentEmails: string[];
}

const ApplyJobPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [jobTitle, setJobTitle] = useState("");
  const [teacherEmail, setTeacherEmail] = useState(
    `${user ? user.email : null}`
  );
  const [studentEmails, setStudentEmails] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobTitle = urlParams.get("jobTitle");
    if (jobTitle) {
      setJobTitle(jobTitle);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jobApplication: JobApplication = {
        jobTitle,

        teacherEmail,
        studentEmails,
      };
      const docRef = await addDoc(
        collection(db, "job-applications"),
        jobApplication
      );
      console.log("Document written with ID: ", docRef.id);

      setTeacherEmail("");
      setStudentEmails([]);
      setErrorMessage("");
    } catch (error) {
      console.error("Error adding document: ", error);
      setErrorMessage("Failed to submit application. Please try again.");
    }
  };

  const handleAddStudentEmail = () => {
    setStudentEmails([...studentEmails, ""]);
  };

  const handleStudentEmailChange = (index: number, value: string) => {
    const updatedStudentEmails = [...studentEmails];
    updatedStudentEmails[index] = value;
    setStudentEmails(updatedStudentEmails);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Apply for {jobTitle} Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Teacher Email:</label>
          <input
            type="email"
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block mb-1">Student Emails:</label>
          {studentEmails.map((email, index) => (
            <input
              key={index}
              type="email"
              value={email}
              onChange={(e) => handleStudentEmailChange(index, e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          ))}
          <button
            type="button"
            onClick={handleAddStudentEmail}
            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Add Student
          </button>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          Apply
        </button>
      </form>
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
    </div>
  );
};

export default ApplyJobPage;
