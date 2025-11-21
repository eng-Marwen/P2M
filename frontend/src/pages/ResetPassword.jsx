// src/pages/ResetPassword.jsx
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { showToast } from "../popups/tostHelper.js";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /*
  const tempResetToken = sessionStorage.getItem("tempResetToken");

  // Redirect if no token (user accessed page directly)
  useEffect(() => {
    if (!tempResetToken) navigate("/forgot-password");
  }, [tempResetToken, navigate]);
*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "/api/auth/reset-password",
        { newPassword, confirmPassword },
        { withCredentials: true }
      );
      // ✅ Clear email from sessionStorage
      sessionStorage.removeItem("resetEmail");
      showToast(
        "Password updated successfully! Redirecting to Sign In...",
        "success"
      );

      setTimeout(() => {
        navigate("/sign-in");
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Something went wrong";
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
            Reset Password
          </h2>
          <p className="text-center text-slate-500 mb-6">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="block mb-1 font-semibold text-slate-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1 font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ResetPassword;
