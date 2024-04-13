"use client";

import { Button } from "@/components/ui/button";
import { logoutUser } from "@/config";
import { auth } from "@/config";
import { OctagonX } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

const DeclinedAccountPage = () => {
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-100">
      <div className="max-w-lg w-full p-8 bg-red-50 shadow-lg rounded-xl text-center">
        <div className="flex items-center justify-center mb-4">
          <OctagonX className="w-12 h-12 mr-2 text-red-600" />
          <p className="font-semibold text-lg">
            Sorry <em>{user && user.email}</em>
          </p>
        </div>
        <p className="mb-4 text-sm">
          Your account has been declined. We apologize, but the administrator
          has determined that your registration is not valid.
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

export default DeclinedAccountPage;
