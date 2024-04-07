"use client";

import { Button } from "@/components/ui/button";
import { logoutUser } from "@/config";

const PendingPage = () => {
  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-3xl mb-6">PENDING ACCOUNT</h1>
      <p className="text-lg mb-8">
        Your account is pending approval by the admin.
      </p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default PendingPage;
