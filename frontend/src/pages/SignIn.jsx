import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { signInFailure, signInSuccess } from "../app/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";
import { showToast } from "../popups/tostHelper.js";

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.id]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/signin",
        formData
      );
      showToast("Signed in successfully", "success");
      dispatch(signInSuccess(response.data.data));
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      dispatch(signInFailure("Sign in failed"));
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Something went wrong";
      showToast(message, "error");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Visual (left) */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-linear-to-b from-rose-50 via-indigo-50 to-sky-50">
          <h2 className="text-2xl font-extrabold text-rose-700 mb-2">
            Welcome back!
          </h2>
          <p className="text-sm text-slate-600 text-center px-6">
            Sign in to manage listings and access your account.
          </p>
        </div>

        {/* Form (right) */}
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-black mb-1">Sign in</h1>
          <p className="text-sm text-black opacity-80 mb-6">
            Sign in to manage listings and more!
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-black">Email</span>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                placeholder="you@example.com"
                aria-label="Email"
              />
            </label>

            <label className="block">
              <span className="text-sm text-black">Password</span>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-400 focus:ring-2 focus:ring-rose-50 focus:border-rose-200"
                placeholder="Your password"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-black hover:opacity-90"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="pt-1">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-20 bg-gray-400" />
                <span className="text-black text-[14px] text-nowrap">
                  or continue with
                </span>
                <span className="h-px w-20 bg-gray-400" />
              </div>
            </div>

            <OAuth />

            <div className="flex flex-col gap-2">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-black underline text-center"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="flex gap-2 pt-5">
            <p className="text-sm text-black text-nowrap">Don't have an account yet?</p>
            <Link
              to="/sign-up"
              className="text-black font-semibold underline text-sm text-nowrap"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SignIn;
