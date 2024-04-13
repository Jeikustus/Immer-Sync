import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/config";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";

interface UserData {
  name: string;
  email: string;
  accountType: string;
  gradeLevel?: string; // Making gradeLevel optional since it depends on accountType
  teacherGrade?: string; // Adding teacherGrade field
  organizationName?: string; // Adding organizationName field
}

const DashboardPage = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUserEmail = `${user ? user.email : null}`;

        if (loggedInUserEmail) {
          const usersCollection = collection(db, "users");
          const q = query(
            usersCollection,
            where("email", "==", loggedInUserEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data() as UserData;
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

  return (
    <div className="h-screen bg-gray-200 dark:bg-gray-800 flex flex-wrap items-center justify-center">
      <div className="container lg:w-2/6 xl:w-2/7 sm:w-full md:w-2/3 bg-white shadow-lg transform duration-200 easy-in-out">
        <div className="h-32 overflow-hidden">
          <Image
            className="w-full"
            src="/background.jpg"
            alt=""
            priority
            width={639}
            height={360}
          />
        </div>
        <div className="flex justify-center px-5 -mt-12">
          <Image
            className="h-32 w-32 bg-white p-2 rounded-full"
            src="/profile.png"
            alt=""
            priority
            width={404}
            height={700}
          />
        </div>
        <div className=" ">
          <div className="text-center px-14">
            <h2 className="text-gray-800 text-3xl font-bold">
              {loading ? "Loading..." : userData?.name || "No Name"}
            </h2>
            <a
              href={`mailto:${userData?.email}`}
              className="text-gray-400 mt-2 hover:text-blue-500"
            >
              {loading ? "Loading..." : userData?.email || "No Email"}
            </a>
            <div className="mt-2 text-gray-500 text-sm">
              <p>
                {loading
                  ? "Loading..."
                  : userData?.accountType || "No Account Type"}
              </p>
              <p>
                {loading
                  ? "Loading..."
                  : userData?.accountType === "student"
                  ? userData?.gradeLevel || "No Grade Level"
                  : userData?.accountType === "teacher"
                  ? userData?.teacherGrade || "No Teacher Grade"
                  : userData?.accountType === "organization"
                  ? userData?.organizationName || "No Organization Name"
                  : "No Grade Level"}
              </p>
            </div>
          </div>
          <hr className="mt-6" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
