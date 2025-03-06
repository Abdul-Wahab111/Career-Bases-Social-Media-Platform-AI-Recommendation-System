"use client"

import { useState, useEffect } from "react"
import { User2, Mail, Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react"
import API from "../services/api"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
    if (e.target.name === "password") {
      calculatePasswordStrength(e.target.value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.match(/[A-Z]/)) strength += 25
    if (password.match(/[0-9]/)) strength += 25
    if (password.match(/[^A-Za-z0-9]/)) strength += 25
    setPasswordStrength(strength)
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter")
      return false
    }
    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number")
      return false
    }
    return true
  }

  const handleSendOTP = async () => {
    if (!formData.email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await API.post("/users/send-otp", { email: formData.email })
      setOtpSent(true)
      setError("")
      setResendDisabled(true)
      setCountdown(60)
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send OTP"
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setError("Please enter the OTP")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await API.post("/users/verify-otp", { email: formData.email, otp: formData.otp })
      setOtpVerified(true)
      setError("")
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid OTP"
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      await API.post("/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
      })

      setRegistrationSuccess(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to register"
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 group transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Login</span>
        </a>

        {/* Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl transform hover:rotate-6 transition-all duration-300 hover:scale-105">
            <span className="text-2xl sm:text-3xl text-white font-bold">SC</span>
          </div>
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Join our growing community today</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl border border-white/20">
          <form onSubmit={handleRegister} className="space-y-5 sm:space-y-6">
            {/* Success Message */}
            {registrationSuccess && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl p-3 sm:p-4 flex items-center gap-2 animate-fade-in shadow-sm border border-green-100 dark:border-green-800">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span className="text-sm">Registration successful! Redirecting to login...</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-xl p-3 sm:p-4 flex items-center gap-2 animate-pulse shadow-sm border border-red-100 dark:border-red-800">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Registration Progress */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    otpSent ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <div className={`w-16 h-1 ${otpSent ? "bg-green-500" : "bg-gray-200"}`}></div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    otpVerified ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <div className={`w-16 h-1 ${otpVerified ? "bg-green-500" : "bg-gray-200"}`}></div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    registrationSuccess ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  3
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {!otpSent ? "Verify Email" : !otpVerified ? "Confirm OTP" : "Complete Registration"}
              </span>
            </div>

            {/* Name Field - Only show after OTP verification */}
            {otpVerified && (
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <User2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    className="block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 dark:text-white text-sm"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Email Field - Only show before OTP verification */}
            {!otpVerified && (
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
                    disabled={otpSent}
                    className={`block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 dark:text-white text-sm ${
                      otpSent ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading || !formData.email}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                ) : (
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>OTP sent to {formData.email}</span>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={resendDisabled || isLoading}
                      className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 transition-colors"
                    >
                      {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OTP Field - Only show after OTP is sent but before verification */}
            {otpSent && !otpVerified && (
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  Verification Code
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <KeyRound className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    required
                    className="block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 dark:text-white text-sm tracking-widest font-medium"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || !formData.otp}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            )}

            {/* Password Fields - Only show after OTP verification */}
            {otpVerified && (
              <>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      className="block w-full pl-10 pr-12 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 dark:text-white text-sm"
                      placeholder="Create a strong password"
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

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength <= 25
                              ? "bg-red-500"
                              : passwordStrength <= 50
                                ? "bg-orange-500"
                                : passwordStrength <= 75
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {passwordStrength <= 25
                            ? "Weak"
                            : passwordStrength <= 50
                              ? "Fair"
                              : passwordStrength <= 75
                                ? "Good"
                                : "Strong"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{passwordStrength}% complete</p>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    <div
                      className={`flex items-center ${formData.password?.length >= 8 ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <div
                        className={`w-3 h-3 mr-1.5 rounded-full ${formData.password?.length >= 8 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                      ></div>
                      8+ characters
                    </div>
                    <div
                      className={`flex items-center ${/[A-Z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <div
                        className={`w-3 h-3 mr-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                      ></div>
                      Uppercase
                    </div>
                    <div
                      className={`flex items-center ${/[0-9]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <div
                        className={`w-3 h-3 mr-1.5 rounded-full ${/[0-9]/.test(formData.password) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                      ></div>
                      Number
                    </div>
                    <div
                      className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      <div
                        className={`w-3 h-3 mr-1.5 rounded-full ${/[^A-Za-z0-9]/.test(formData.password) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                      ></div>
                      Special char
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      className="block w-full pl-10 pr-12 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 dark:text-white text-sm"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye size={18} className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>

                  {/* Password match indicator */}
                  {formData.confirmPassword && (
                    <div
                      className={`flex items-center mt-1 text-xs ${
                        formData.password === formData.confirmPassword
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle2 size={12} className="mr-1" />
                          Passwords match
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} className="mr-1" />
                          Passwords don't match
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Submit Button - Only show after OTP verification */}
            {otpVerified && (
              <button
                type="submit"
                disabled={isLoading || registrationSuccess}
                className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Creating account...</span>
                  </>
                ) : registrationSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Account created!</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            )}

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href="/"
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  Sign in instead
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            By creating an account, you agree to our{" "}
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

export default Register

