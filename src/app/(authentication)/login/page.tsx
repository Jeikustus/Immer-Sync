"use client";

import { useState } from "react";
import { checkAccountType, signInWithEmailAndPassword } from "@/config";
import { InputWithLabel } from "@/components/ui/input-label";
import { Button } from "@/components/ui/button";
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await signInWithEmailAndPassword(
        formData.email,
        formData.password
      );

      const accountType = await checkAccountType(user.uid);

      if (accountType === "pending") {
        window.location.href = "/pending";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="pt-7">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center space-y-4">
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
          {error && <div className="text-red-500">{error}</div>}
          <Button type="submit" disabled={loading}>
            Sign in
          </Button>
        </div>
        <div className="text-sm pt-1">
          <a href="/forget">
            <p>Forgot Password? Click here..</p>
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
