import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { signInFailure, signInSuccess } from "../app/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";
import { showToast } from "../popups/tostHelper.js";

const COUNTRY_CODES = [
  { code: "+216", label: "Tunisia", flag: "🇹🇳" },
  { code: "+212", label: "Morocco", flag: "🇲🇦" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
];

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    address: "",
    phone: "",
  });

  // phone prefix (flag + dial code)
  const [phonePrefix, setPhonePrefix] = useState("+216");

  const [load, setLoad] = useState(false);

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.id]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      // combine prefix with phone before sending
      const payload = {
        ...formData,
        phone: formData.phone ? `${phonePrefix}${formData.phone}` : "",
      };

      const response = await axios.post(
        "http://localhost:4000/api/auth/signup",
        payload
      );
      showToast("User created!", "success");
      dispatch(signInSuccess(response.data.data));
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      dispatch(signInFailure("Signup failed"));
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Something went wrong";
      showToast(message, "error");
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left - visual */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-linear-to-b from-rose-50 via-indigo-50 to-sky-50">
          <h2 className="text-2xl font-extrabold text-rose-700 mb-2">
            Welcome!
          </h2>
          <p className="text-sm text-slate-600 text-center px-6">
            Create an account to list properties, save favorites and manage your
            profile.
          </p>
          <div className="mt-6 w-40 h-40 rounded-xl bg-white/60 shadow-inner grid place-items-center">
            {/* svg */}
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              className="text-rose-400"
            >
              <path
                d="M3 9.75L12 4l9 5.75v8.5A1.75 1.75 0 0 1 19.25 20H4.75A1.75 1.75 0 0 1 3 18.25v-8.5z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 21v-6.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1V21"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Right - form */}
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-black mb-1 ">
            Create account
          </h1>
          <p className="text-sm text-black opacity-80 mb-6">
            Sign up to manage listings and more !
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

            {/* Username (full width) */}
            <label className="block">
              <span className="text-sm text-black">Username</span>
              <input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-400 focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200"
                placeholder="Your display name"
              />
            </label>

            {/* Phone (below username) with prefix + flags */}
            <label className="block">
              <span className="text-sm text-black">Phone</span>
              <div className="mt-1 flex gap-2">
                <select
                  aria-label="Country code"
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="w-20 shrink-0  py-2 rounded-lg border border-gray-400 bg-white text-sm"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {`${c.flag} ${c.code}`}
                    </option>
                  ))}
                </select>

                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-400 focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200 w-6"
                  placeholder="25 123 456"
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Phone will be saved with selected country code.
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-black">Password</span>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-400 focus:ring-2 focus:ring-rose-50 focus:border-rose-200"
                placeholder="Choose a secure password"
              />
            </label>

            <label className="block">
              <span className="text-sm text-black">Address (optional)</span>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-400 focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200"
                placeholder="City, street or region"
              />
            </label>

            <button
              type="submit"
              disabled={load}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-black"
            >
              {load ? "Creating..." : "Create Account"}
            </button>

            <div className="pt-1">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-20 bg-gray-400" />
                <span className=" text-black  text-[14px] text-nowrap">or continue with</span>
                <span className="h-px w-20 bg-gray-400" />
              </div>
              <div className="mt-3 ">
                <OAuth />
              </div>
            </div>

            <p className="text-xs text-center text-slate-500">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="text-black font-semibold underline">
                Terms
              </Link>{" "}
              &{" "}
              <Link to="/privacy" className="text-black font-semibold underline">
                Privacy
              </Link>
              .
            </p>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link
              to="/sign-in"
              className="text-black  font-semibold underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SignUp;
