"use client";

import Link from "next/link";
import {
  BadgePlus,
  BellRing,
  CircleUserRound,
  CircleX,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareHeart,
  Search,
  Settings,
  ShieldEllipsis,
  X,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, logoutUser } from "@/config";
import { Button } from "@/components/ui/button";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  name: string;
  email: string;
  accountType: string;
  gradeLevel?: string;
  teacherGrade?: string;
  organizationName?: string;
}

export const NavigationBar = () => {
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

  const handleLogout = async () => {
    logoutUser();
    window.location.href = "/";
  };

  return (
    <nav className="shadow-md shadow-white bg-[#2b4032] text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
        <div className="flex justify-center items-center space-x-5">
          <div className="font-bold text-3xl drop-shadow-lg">
            <span className="text-[#88AB8E] ">Immer</span>
            <span className="text-slate-500">Sync</span>
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-2 lg:grid-cols-4">
          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            <LayoutDashboard />
            <Link href={"/dashboard"}>
              <Button variant={"ghost"}>Dashboard</Button>
            </Link>
          </div>
          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            {loading ? (
              "Loading..."
            ) : (
              <>
                {userData?.accountType === "Admin" && (
                  <>
                    <ShieldEllipsis />
                    <Link href={"/admin"}>
                      <Button variant={"ghost"}>Admin</Button>
                    </Link>
                  </>
                )}
                {userData?.accountType === "Student" && (
                  <>
                    <MessageSquareHeart />
                    <Link href={"/feedback"}>
                      <Button variant={"ghost"}>Feedback</Button>
                    </Link>
                  </>
                )}
                {userData?.accountType === "Teacher" && (
                  <>
                    <Search />
                    <Link href={"/find-job"}>
                      <Button variant={"ghost"}>Find Job</Button>
                    </Link>
                  </>
                )}
                {userData?.accountType === "Organization" && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
                          <BadgePlus />
                          <p className="px-1 text-md">Jobs</p>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <div className="flex justify-center items-center">
                            <BadgePlus />
                            <Link href={"/post-job"}>
                              <Button variant={"ghost"}>Post Job</Button>
                            </Link>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex justify-center items-center">
                            <Search />
                            <Link href={"/job-view-feedback"}>
                              <Button variant={"ghost"}>View Feedback</Button>
                            </Link>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                {(!userData ||
                  !["Student", "Teacher", "Organization", "Admin"].includes(
                    userData.accountType
                  )) && (
                  <>
                    <CircleX />
                    <Link href={"/dashboard"}>
                      <Button variant={"ghost"}>Error</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            <BellRing />
            <Link href={"/notification"}>
              <Button variant={"ghost"}>Notification</Button>
            </Link>
          </div>
          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            <Mail />
            <Link href={"/chat"}>
              <Button variant={"ghost"}>Messages</Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center space-x-5 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-center items-center">
            <div className="font-semibold">
              {user ? (
                <div className="flex justify-center items-center">
                  <CircleUserRound />
                  <p className="font-semibold">
                    <em>{user.email}</em>
                  </p>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <CircleUserRound />
                  <p className="font-semibold">
                    <em>{` no users found: ${null}`}</em>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row items-center justify-center space-y-1">
            <Button variant={"ghost"} size={"sm"}>
              <Settings />
            </Button>
            <Button variant={"ghost"} size={"sm"} onClick={handleLogout}>
              <LogOut />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
