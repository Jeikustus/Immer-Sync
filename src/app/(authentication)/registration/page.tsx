"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-label";
import { createUserWithEmailAndPassword } from "@/config"; // Assuming you have this function in your firebaseAuth file

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: string;
}

const RegistrationScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "pending",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(
        formData.email,
        formData.password,
        formData.name,
        formData.accountType
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        accountType: "pending",
      });
      setError(null);

      alert("Successfully registered");

      window.location.href = "/pending";
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="pt-7">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center space-y-4">
          <InputWithLabel
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
          <InputWithLabel
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          <InputWithLabel
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          <InputWithLabel
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
          {error && <div className="text-red-500">{error}</div>}
          <Button type="submit">Submit</Button>
          <div className="invisible">
            <InputWithLabel
              label="Account Type"
              type="text"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              placeholder="Enter your account type"
              required
              disabled
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationScreen;
