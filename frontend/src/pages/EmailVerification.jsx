import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { signInFailure, signInSuccess } from "../app/user/userSlice.js";
import { showToast } from "../popups/tostHelper.js";

const EmailVerification = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (index, value) => {
    const newCode = [...code];

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      // Focus on the last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    axios
      .post("http://localhost:4000/api/auth/verify-email", {
        code: verificationCode,
      })
      .then((response) => {
        console.log(response.data);
        showToast("User is signed up!", "success");
        dispatch(signInSuccess(response.data.data));
        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((err) => {
        const message =
          err.response?.data?.message || // if your backend sends { message: "..." }
          err.response?.data || // if backend sends plain text
          err.message || // fallback from axios
          "Something went wrong";
        console.log(message);
        dispatch(signInFailure(message));
        showToast(message, "error");
      });
  };

  // Auto submit when all fields are filled
  useEffect(() => {}, []);

  return (
    <>
      <div className="mx-auto my-14 max-w-md w-full  rounded-2xl shadow-xl overflow-hidden">
        <div className=" bg-slate-200 shadow-md rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-semiboldbold mb-6 text-center  text-slate-700 ">
            Verify Your Email
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
                  maxLength="6"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold bg-slate-500 text-white border-2 border-slate-700 rounded-lg focus:border-emerald-600 focus:outline-none"
                />
              ))}
            </div>
            <button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full  bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              Submit Code
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};
export default EmailVerification;
