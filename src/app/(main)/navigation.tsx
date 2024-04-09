"use client";

import Link from "next/link";
import {
  BellRing,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareHeart,
  Settings,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logoutUser } from "@/config";
import { Button } from "@/components/ui/button";

export const NavigationBar = () => {
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    logoutUser();
    window.location.href = "/";
  };

  return (
    <nav className="shadow-md shadow-white bg-[#2b4032] text-white">
      <div className="grid grid-cols-3 p-4">
        <div className="flex justify-center items-center space-x-5">
          <div className="font-bold text-3xl drop-shadow-lg">
            <span className="text-[#88AB8E] ">Immer</span>
            <span className="text-slate-500">Sync</span>
          </div>
        </div>
        <div className="grid grid-cols-4">
          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            <LayoutDashboard />
            <Link href={"/dashboard"}>
              <Button variant={"ghost"}>Dashboard</Button>
            </Link>
          </div>
          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            <MessageSquareHeart />
            <Link href={"/feedback"}>
              <Button variant={"ghost"}>Feedback</Button>
            </Link>
          </div>
          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            <BellRing />
            <Link href={"/notifcation"}>
              <Button variant={"ghost"}>Notification</Button>
            </Link>
          </div>
          <div className="flex justify-center items-center hover:bg-white hover:text-black hover:rounded-md">
            <Mail />
            <Link href={"/messages"}>
              <Button variant={"ghost"}>Messages</Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center space-x-5">
          <div className="flex justify-center items-center">
            <div className="font-semibold">
              {user ? (
                <div className="flex justify-center items-center">
                  <CircleUserRound />
                  <p className="font-semibold">
                    <em>{user.email}</em>
                  </p>
                </div>
              ) : null}
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
