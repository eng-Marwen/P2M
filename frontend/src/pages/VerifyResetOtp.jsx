// src/pages/VerifyResetOtp.jsx
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { showToast } from "../popups/tostHelper.js";

const VerifyResetOtp = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

const email = sessionStorage.getItem("resetEmail");
  console.log("Email from location state:", email);
  // Redirect if email is missing (user navigated directly)
useEffect(() => {
  if (!email) {
    showToast("Session expired. Please start over.", "error");
    navigate("/forgot-password");
  }
}, [email, navigate]);


  // Handle input changes
  const handleChange = (index, value) => {
    const newCode = [...code];

    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) newCode[i] = pastedCode[i] || "";
      setCode(newCode);

      const lastFilled = newCode.findLastIndex((d) => d !== "");
      const focusIndex = lastFilled < 5 ? lastFilled + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    console.log("Verifying OTP for email:", email, "Code:", verificationCode);
    try {
      await axios.post(
        "/api/auth/verify-reset-otp",
        { email, otp: verificationCode },
        { withCredentials: true } // allow backend to set cookie
      );
      console.log("OTP verified successfully");
      showToast("OTP verified successfully!", "success");

      setTimeout(() => {
        navigate("/reset-password");
      }, 1000);
      console.log("Navigating to Reset Password page");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Something went wrong";
      showToast(message, "error");
    }
  };

  return (
    <>
      <div className="mx-auto my-14 max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-200 shadow-md rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-6 text-center text-slate-700">
            Verify OTP
          </h2>
          <p className="text-center text-slate-500 mb-6">
            Enter the 6-digit code sent to your email address.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold bg-slate-500 text-white border-2 border-slate-700 rounded-lg focus:border-emerald-600 focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default VerifyResetOtp;
