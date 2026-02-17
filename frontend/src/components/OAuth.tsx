import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../app/store";
import { signInFailure, signInSuccess } from "../app/user/userSlice";
import { app } from "../firebase";
import { uploadToCloudinary } from "../lib/cloudinary";
import { showToast } from "../popups/tostHelper";

const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Helper to upload remote image to Cloudinary
  const uploadRemoteImageToCloudinary = async (
    url: string,
  ): Promise<string | null> => {
    try {
      console.log("Fetching image from:", url);
      const resp = await fetch(url, { mode: "cors" });

      if (!resp.ok) {
        console.error("Failed to fetch image:", resp.status, resp.statusText);
        return null;
      }

      const blob = await resp.blob();
      console.log("Blob received, type:", blob.type, "size:", blob.size);

      const filename = `avatar_${Date.now()}.${(blob.type || "image/jpeg")
        .split("/")
        .pop()}`;
      const file = new File([blob], filename, {
        type: blob.type || "image/jpeg",
      });

      console.log("Uploading to Cloudinary...");
      const result = await uploadToCloudinary(file, { folder: "avatars" });
      console.log("Cloudinary upload result:", result);

      return result?.secure_url || null;
    } catch (err) {
      console.error(
        "Cloudinary upload failed:",
        err instanceof Error ? err.message : err,
      );
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

      let avatarUrl = user.photoURL || "";
      console.log("Original avatar URL:", avatarUrl);

      if (avatarUrl) {
        try {
          console.log("Attempting to upload avatar to Cloudinary...");
          const uploaded = await uploadRemoteImageToCloudinary(avatarUrl);
          if (uploaded) {
            console.log(
              "Avatar successfully uploaded to Cloudinary:",
              uploaded,
            );
            avatarUrl = uploaded;
          } else {
            console.log(
              "Cloudinary upload returned null, using original Google photo URL",
            );
          }
        } catch (uploadError) {
          console.error(
            "Cloudinary upload error, using original Google photo URL:",
            uploadError,
          );
          // Keep the original avatarUrl from Google
        }
      }

      console.log("Final avatar URL to send:", avatarUrl);

      const body = {
        username: user.displayName,
        email: user.email,
        avatar: avatarUrl,
      };
      const response = await axios.post<{ data: any }>(
        "/api/auth/google",
        body,
        { withCredentials: true },
      );
      console.log(
        "User signed up/sign in with Google successfully:",
        response.data,
      );
      dispatch(signInSuccess(response.data.data));

      showToast("User is signed up!", "success");
      navigate("/create-house");
    } catch (error) {
      dispatch(signInFailure("Something went wrong with Google OAuth"));
      console.error("OAuth error:", error);
      console.error("There was an error signing up!", error);
      const axiosError = error as any;
      const message =
        axiosError.response?.data?.message || // if your backend sends { message: "..." }
        axiosError.response?.data || // if backend sends plain text
        axiosError.message || // fallback from axios
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
