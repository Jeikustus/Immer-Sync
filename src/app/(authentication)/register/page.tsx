"use client";

import React, { useState } from "react";
import { InputWithLabel } from "@/components/ui/input-label";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword } from "@/config";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { TabsList } from "@radix-ui/react-tabs";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [classSection, setClassSection] = useState("");
  const [teacherGrade, setTeacherGrade] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string>("student");

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    let additionalInfo = "";

    if (accountType === "student") {
      additionalInfo = gradeLevel;
    } else if (accountType === "teacher") {
      additionalInfo = teacherGrade;
    } else if (accountType === "organization") {
      additionalInfo = organizationName;
    }

    try {
      await createUserWithEmailAndPassword(
        email,
        password,
        fullName,
        additionalInfo,
        accountType
      );

      alert("User registered successfully.");
      window.location.href = "/";
    } catch (error) {
      setError((error as Error).message);
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
          <div>
            <Tabs defaultValue="student" className="w-[400px]">
              <TabsList>
                <TabsTrigger
                  value="student"
                  onClick={() => setAccountType("student")}
                >
                  Student
                </TabsTrigger>
                <TabsTrigger
                  value="teacher"
                  onClick={() => setAccountType("teacher")}
                >
                  Teacher
                </TabsTrigger>
                <TabsTrigger
                  value="organization"
                  onClick={() => setAccountType("organization")}
                >
                  Organization
                </TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <InputWithLabel
                  label="Grade Level"
                  type="text"
                  placeholder="Enter your grade level"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="mb-4"
                />
                <InputWithLabel
                  label="Section"
                  type="text"
                  placeholder="Enter your grade level"
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value)}
                  className="mb-4"
                />
              </TabsContent>
              <TabsContent value="teacher">
                <InputWithLabel
                  label="Teacher Grade"
                  type="text"
                  placeholder="Enter your teacher grade"
                  value={teacherGrade}
                  onChange={(e) => setTeacherGrade(e.target.value)}
                  className="mb-4"
                />
              </TabsContent>
              <TabsContent value="organization">
                <InputWithLabel
                  label="Organization Name"
                  type="text"
                  placeholder="Enter your organization name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="mb-4"
                />
              </TabsContent>
            </Tabs>
          </div>

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
            Register as {accountType}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
