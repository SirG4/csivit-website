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
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setError("An error occurred during login");
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
          {/* Login Card */}
          <div className="w-full max-w-2xl mt-10">
            {/* Login Form Card */}
            <div className="bg-black/40 relative py-18 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl animate-fade-in-up">
              <div className="md:w-[400px] md:h-[200px] w-[300px] h-[150px] absolute top-1/2 left-1/2 -translate-x-1/2 md:-translate-y-[195%] -translate-y-[245%]">
                <Image
                  src="/Login/csivit.png"
                  alt="CSI-VIT Logo"
                  fill
                  className="object-contain"
                />
              </div>
              {/* Toggle Buttons */}

              <h1 className="minercraft text-center  text-2xl m-2 shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-[#A9A9A9] to-[#848383]">
                ENGINEERING IDEAS IN REALITY
              </h1>
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field (Sign Up only) */}

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
                  style={{ animationDelay: "400ms" }}
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

                {/* Remember Me & Forgot Password (Login only) */}
                {isLogin && (
                  <div
                    className="flex items-center justify-between animate-fade-in-up"
                    style={{ animationDelay: "600ms" }}
                  >
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        Remember me
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full overflow-hidden px-2 text-3xl pb-2 bg-[#0C6E3D] border-t-4 border-[#27CE40]  text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 animate-fade-in-up disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ animationDelay: "800ms" }}
                >
                  <div className="h-[100%] font-minercraft  py-1 w-full bg-[#008A44]">
                    {loading
                      ? "Signing In..."
                      : isLogin
                      ? "Sign In"
                      : "Create Account"}
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

                {/* Social Login Buttons */}
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
                  <span>Don't have an account? </span>
                  <Link
                    href="/signup"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Create one
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
