import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../popups/tostHelper";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const VerifyResetOtp = () => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Get email from sessionStorage
  const email = sessionStorage.getItem("resetEmail");
  console.log("Email from sessionStorage:", email);

  // Redirect if email is missing (session expired)
  useEffect(() => {
    if (!email) {
      showToast("Session expired. Please start over.", "error");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Handle input changes (typing)
  const handleChange = (index: number, value: string) => {
    const newCode = [...code];

    if (value.length > 1) {
      // Ignore multiple characters in normal typing; paste is handled separately
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    // Move focus to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // keep digits only
    const pastedCode = pastedData.slice(0, 6).split("");
    const newCode = [...code];

    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedCode[i] || "";
      if (inputRefs.current[i]) {
        inputRefs.current[i]!.value = newCode[i];
      }
    }

    setCode(newCode);

    // Focus last filled input
    const lastFilledIndex = pastedCode.length - 1;
    if (inputRefs.current[lastFilledIndex]) {
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const verificationCode = code.join("");
    console.log("Verifying OTP for email:", email, "Code:", verificationCode);

    try {
      await axios.post<ApiResponse>(
        "/api/auth/verify-reset-otp",
        { email, otp: verificationCode },
        { withCredentials: true }, // backend cookie support
      );

      showToast("OTP verified successfully!", "success");

      // Redirect to ResetPassword page
      setTimeout(() => {
        navigate("/reset-password");
      }, 1000);
    } catch (err: unknown) {
      const error = err as any;
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
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
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e)}
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
    </>
  );
};

export default VerifyResetOtp;
