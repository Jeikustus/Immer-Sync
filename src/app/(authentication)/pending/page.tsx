"use client";

import { Button } from "@/components/ui/button";
import { logoutUser } from "@/config";
import { auth } from "@/config";
import { PersonStanding } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

const PendingPage = () => {
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-8 bg-white shadow-md rounded-md text-center">
        <div className="flex items-center justify-center mb-4">
          <PersonStanding className="w-12 h-12 mr-2" />
          <p className="font-semibold text-lg">
            Welcome <em>{user && user.email}</em>
          </p>
        </div>
        <p className="mb-4">
          Your account is pending approval. Please wait for the admin to verify
          your account.
        </p>
        <Button
          onClick={handleLogout}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default PendingPage;
