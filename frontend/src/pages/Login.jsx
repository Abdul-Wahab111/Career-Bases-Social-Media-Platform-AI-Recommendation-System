"use client"

import { useState } from "react"
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Coffee } from "lucide-react"
import API from "../services/api"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data } = await API.post("/users/login", {
        email: formData.email,
        password: formData.password,
      })

      localStorage.setItem("token", data.token)
      setLoginSuccess(true)

      // Check for user profile
      try {
        const profileRes = await API.get("/profiles/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        })

        setTimeout(() => {
          window.location.href = "/posts"
        }, 1500)
      } catch (error) {
        if (error.response?.data?.message === "Profile not found") {
          setTimeout(() => {
            window.location.href = "/profile"
          }, 1500)
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials"
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl transform hover:rotate-6 transition-all duration-300 hover:scale-105">
            <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl border border-white/20">
          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            {/* Success Message */}
            {loginSuccess && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl p-3 sm:p-4 flex items-center gap-2 animate-fade-in shadow-sm border border-green-100 dark:border-green-800">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span className="text-sm">Login successful! Redirecting...</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-xl p-3 sm:p-4 flex items-center gap-2 animate-pulse shadow-sm border border-red-100 dark:border-red-800">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 dark:text-white text-sm"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="block w-full pl-10 pr-12 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 dark:text-white text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye size={18} className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Signing in...</span>
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Signed in!</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  Create one now
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-400 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-400 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

