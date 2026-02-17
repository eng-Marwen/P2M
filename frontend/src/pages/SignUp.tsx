import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch } from "../app/store";
import { signInFailure } from "../app/user/userSlice";
import logoImage from "../assets/image-removebg-preview.png";
import OAuth from "../components/OAuth";
import { showToast } from "../popups/tostHelper";

interface CountryCode {
  code: string;
  label: string;
  flag: string;
}

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  address: string;
  phone: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "+216", label: "Tunisia", flag: "🇹🇳" },
  { code: "+212", label: "Morocco", flag: "🇲🇦" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
];

const SignUp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpForm>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      address: "",
      phone: "",
    },
  });

  const [phonePrefix, setPhonePrefix] = useState<string>("+216");
  const [load, setLoad] = useState<boolean>(false);

  const handleFormSubmit = async (data: SignUpForm) => {
    setLoad(true);
    try {
      const payload = {
        ...data,
        phone: data.phone ? `${phonePrefix}${data.phone}` : "",
      };

      await axios.post("/api/auth/signup", payload);
      showToast("OTP code sent to your mail address!", "success");

      navigate("/verify-email");
    } catch (err: unknown) {
      dispatch(signInFailure("Signup failed"));
      const error = err as any;
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

          <img
            src={logoImage}
            alt="Samsar Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        {/* Right - form */}
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-black mb-1 ">
            Create account
          </h1>
          <p className="text-sm text-black opacity-80 mb-6">
            Sign up to manage listings and more !
          </p>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <label className="block">
              <span className="text-sm text-black">Email</span>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`mt-1 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-100 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-400 focus:border-rose-300"
                }`}
                placeholder="you@example.com"
                aria-label="Email"
              />
              {errors.email ? (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              ) : (
                <div className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                  Please use a non-institutional address
                </div>
              )}
            </label>

            {/* Username (full width) */}
            <label className="block">
              <span className="text-sm text-black">Username</span>
              <input
                type="text"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                className={`mt-1 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-50 ${
                  errors.username
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-400 focus:border-indigo-200"
                }`}
                placeholder="Your display name"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
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
                  type="tel"
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9]{8,15}$/,
                      message: "Phone must be 8-15 digits",
                    },
                  })}
                  className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-50 w-6 ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-400 focus:border-indigo-200"
                  }`}
                  placeholder="25 123 456"
                />
              </div>
              {errors.phone ? (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              ) : (
                <div className="text-xs text-gray-400 mt-1">
                  Phone will be saved with selected country code.
                </div>
              )}
            </label>

            <label className="block">
              <span className="text-sm text-black">Password</span>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={`mt-1 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-50 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-400 focus:border-rose-200"
                }`}
                placeholder="Choose a secure password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm text-black">Address (optional)</span>
              <input
                type="text"
                {...register("address")}
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
                <span className=" text-black  text-[14px] text-nowrap">
                  or continue with
                </span>
                <span className="h-px w-20 bg-gray-400" />
              </div>
              <div className="mt-3 ">
                <OAuth />
              </div>
            </div>

            <p className="text-xs text-center text-slate-500">
              By creating an account you agree to our{" "}
              <span className="font-semibold text-black hover:underline">
                Terms
              </span>{" "}
              &{" "}
              <span className="font-semibold text-black hover:underline">
                Privacy
              </span>
              .
            </p>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link to="/sign-in" className="text-black  font-semibold underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
