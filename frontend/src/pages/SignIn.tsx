import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch } from "../app/store";
import { signInFailure, signInSuccess } from "../app/user/userSlice";
import OAuth from "../components/OAuth";
import { showToast } from "../popups/tostHelper";

interface SignInForm {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const SignIn = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = async (data: SignInForm) => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/auth/signin", data);
      showToast("Signed in successfully", "success");
      dispatch(signInSuccess(response.data.data));
      navigate("/");
    } catch (err: unknown) {
      dispatch(signInFailure("Sign in failed"));
      const error = err as any;
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
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
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
                placeholder="Your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
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
            <p className="text-sm text-black text-nowrap">
              Don't have an account yet?
            </p>
            <Link
              to="/sign-up"
              className="text-black font-semibold underline text-sm text-nowrap"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
