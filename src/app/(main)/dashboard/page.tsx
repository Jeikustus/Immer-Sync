"use client";

import { Button } from "@/components/ui/button";
import { logoutUser } from "@/config";

const DashboardPage = () => {
  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <div>
      <h1>DASHBOARD</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default DashboardPage;
