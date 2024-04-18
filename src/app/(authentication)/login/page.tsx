"use client";

import React, { useState } from "react";
import { InputWithLabel } from "@/components/ui/input-label";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword, checkAccountType, auth } from "@/config";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(email, password);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const { accountType } = await checkAccountType(currentUser.uid);
        // check
        if (accountType !== null) {
          switch (accountType) {
            case "Admin":
              window.location.href = "/admin";
              break;
            case "pending":
              window.location.href = "/pending";
              break;
            case "declined":
              window.location.href = "/declined-account";
              break;
            default:
              window.location.href = "/dashboard";
              break;
          }
        } else {
          console.error("Account type is null");
        }
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold ">LOGIN</h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <InputWithLabel
              label="Email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <InputWithLabel
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
            >
              Login
            </Button>
            <div className="text-sm mt-2">
              <p
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => {
                  window.location.href = "/forgot-password";
                }}
              >
                Forgot password? Click here!
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
