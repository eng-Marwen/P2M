import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInFailure, signInSuccess } from "../app/user/userSlice.js";
import { app } from "../firebase";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { showToast } from "../popups/tostHelper.js";

const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // helper: download remote image URL -> File -> upload to Cloudinary -> return secure_url
  const uploadRemoteImageToCloudinary = async (url) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const filename = `avatar_${Date.now()}.${(blob.type || "image/jpeg")
        .split("/")
        .pop()}`;
      const file = new File([blob], filename, {
        type: blob.type || "image/jpeg",
      });
      const result = await uploadToCloudinary(file, { folder: "avatars" });
      return result?.secure_url || null;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return null;
    }
  };

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      console.log("OAuth result:", result);
      const user = result.user;
      console.log("OAuth user:", user);
      // try to upload the google avatar to Cloudinary and use that link
      let avatarUrl = user.photoURL || "";
      if (avatarUrl) {
        const uploaded = await uploadRemoteImageToCloudinary(avatarUrl);
        if (uploaded) avatarUrl = uploaded;
      }

      const body = {
        username: user.displayName,
        email: user.email,
        avatar: avatarUrl,
      };
      const response = await axios.post(
        "http://localhost:4000/api/auth/google",
        body,
        { withCredentials: true }
      );
      console.log(
        "User signed up/sign in with Google successfully:",
        response.data
      );
      dispatch(signInSuccess(response.data.data));

      showToast("User is signed up!", "success");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      dispatch(signInFailure("Something went wrong with Google OAuth"));
      console.error("OAuth error:", error);
      console.error("There was an error signing up!", error);
      const message =
        error.response?.data?.message || // if your backend sends { message: "..." }
        error.response?.data || // if backend sends plain text
        error.message || // fallback from axios
        "Something went wrong with Google OAuth";
      console.log(message);
      showToast(message, "error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-red-700 hover:bg-red-800 transition-colors"
      aria-label="Continue with Google"
    >
      <span>Continue with Google</span>

      {/* Google "G" icon */}
      <svg
        className="w-5 h-5"
        viewBox="0 0 533.5 544.3"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#4285F4"
          d="M533.5 278.4c0-19.5-1.8-38.2-5.2-56.4H272v106.8h147.6c-6.4 34.9-25.6 64.4-54.6 84.1v69.8h88.1c51.7-47.7 81.4-117.9 81.4-204.3z"
        />
        <path
          fill="#34A853"
          d="M272 544.3c73.6 0 135.4-24.5 180.6-66.6l-88.1-69.8c-24.9 16.7-56.8 26.6-92.5 26.6-71 0-131.2-47.9-152.6-112.2H29.2v70.5C74.4 487.1 167.8 544.3 272 544.3z"
        />
        <path
          fill="#FBBC05"
          d="M119.4 322.3c-10.6-31.2-10.6-64.9 0-96.1V155.7H29.2c-38.5 74.5-38.5 162 0 236.5l90.2-69.9z"
        />
        <path
          fill="#EA4335"
          d="M272 107.7c39.9 0 75.8 13.7 104 40.6l78-78C418.3 25.3 345.6 0 272 0 167.8 0 74.4 57.2 29.2 155.7l90.2 70.5C140.8 155.6 201 107.7 272 107.7z"
        />
      </svg>
    </button>
  );
};

export default OAuth;
