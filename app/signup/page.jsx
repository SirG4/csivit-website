"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton/BackButton";
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail } from "react-icons/fi";
import { FaGithub, FaGoogle } from "react-icons/fa";

const page = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Default to signup state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Register user
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setSuccess(true);

      // Auto-login after successful signup
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInResult?.error) {
        setError("Account created but login failed. Please login manually.");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <BackButton />
      <div className="min-h-screen relative bg-[url('/Login/loginBack.png')] bg-no-repeat bg-cover bg-center">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          {/* Signup Card */}
          <div className="w-full max-w-2xl mt-10">
            {/* Signup Form Card */}
            <div className="bg-black/40 relative pt-32 md:pt-24 pb-8 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl animate-fade-in-up">
              <div className="md:w-[400px] md:h-[200px] w-[300px] h-[150px] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Image
                  src="/Login/csivit.png"
                  alt="CSI-VIT Logo"
                  fill
                  className="object-contain"
                />
              </div>

              <h1 className="minercraft text-center text-2xl mb-6 shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-[#A9A9A9] to-[#848383]">
                ENGINEERING IDEAS IN REALITY
              </h1>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                  Account created successfully! Redirecting...
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div
                  className="animate-fade-in-left"
                  style={{ animationDelay: "100ms" }}
                >
                  <div className="relative">
                    <FiUser
                      size={22}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-3 bg-black/70 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div
                  className="animate-fade-in-left"
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="relative">
                    <FiMail
                      size={22}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-black/70 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div
                  className="animate-fade-in-left"
                  style={{ animationDelay: "300ms" }}
                >
                  <div className="relative">
                    <FiLock
                      size={22}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-black/70 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div
                  className="animate-fade-in-left"
                  style={{ animationDelay: "400ms" }}
                >
                  <div className="relative">
                    <FiLock
                      size={22}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-12 py-3 bg-black/70 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full overflow-hidden px-2 text-3xl pb-2 bg-[#0C6E3D] border-t-4 border-[#27CE40]  text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: "800ms" }}
                >
                  <div className="h-[100%] font-minercraft  py-1 w-full bg-[#008A44]">
                    Create Account
                  </div>
                </button>

                {/* Divider */}
                <div
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: "1000ms" }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Buttons */}
                <div
                  className="grid grid-cols-2 gap-4 animate-fade-in-up"
                  style={{ animationDelay: "1200ms" }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      signIn("google", { callbackUrl: "/profile" })
                    }
                    className="flex items-center justify-center py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaGoogle className="mr-2" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      signIn("github", { callbackUrl: "/profile" })
                    }
                    className="flex items-center justify-center py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaGithub className="mr-2" />
                    GitHub
                  </button>
                </div>

                {/* Bottom Toggle */}
                <div
                  className="mt-4 text-center text-sm text-gray-300 animate-fade-in-up"
                  style={{ animationDelay: "1300ms" }}
                >
                  <span>Already have an account? </span>
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
