"use client";

import React, { useState } from "react";
import { InputWithLabel } from "@/components/ui/input-label";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword } from "@/config";
import { auth, db } from "@/config";
import { addDoc, collection } from "firebase/firestore";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Create user with email and password in Firebase Authentication
      await createUserWithEmailAndPassword(
        email,
        password,
        fullName,
        gradeLevel,
        "pending"
      );

      // Redirect the user after successful registration
      alert("User registered successfully.");
      window.location.href = "/"; // Redirect to the home page
    } catch (error) {
      setError((error as Error).message); // Set error message if registration fails
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full p-8 ">
        <h1 className="text-2xl font-bold mb-4">REGISTER</h1>
        <form onSubmit={handleRegister}>
          <InputWithLabel
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mb-4"
          />
          <InputWithLabel
            label="Grade Level"
            type="text"
            placeholder="Enter your grade level"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="mb-4"
          />
          <InputWithLabel
            label="Email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <InputWithLabel
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <InputWithLabel
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-6"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
