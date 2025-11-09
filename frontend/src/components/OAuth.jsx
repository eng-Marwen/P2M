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
      className="bg-red-700  text-white p-3 uppercase rounded-lg
          hover:opacity-95 disabled:opacity-80"
    >
      continue with Google
    </button>
  );
};

export default OAuth;
