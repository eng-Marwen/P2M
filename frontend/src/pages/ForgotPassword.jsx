// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { showToast } from "../popups/tostHelper.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      showToast(response.data.message || "OTP sent to your email.", "success");

      // Navigate to VerifyResetOtp page after short delay
      setTimeout(() => {
        sessionStorage.setItem("resetEmail", email);
        navigate("/verify-reset-otp");
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Something went wrong. Please try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto my-14 max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-200 shadow-md rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-6 text-center text-slate-700">
            Forgot Password
          </h2>
          <p className="text-center text-slate-500 mb-6">
            Enter your email to receive a password reset OTP.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="block mb-1 font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ForgotPassword;
