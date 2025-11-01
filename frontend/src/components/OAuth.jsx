import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess,signInFailure } from "../app/user/userSlice.js";
import { app } from "../firebase";
import { showToast } from "../popups/tostHelper.js";


const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      console.log("OAuth result:", result);
      const user = result.user;
      console.log(user);
      const body = {
        username: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      };
      const response = await axios.post("http://localhost:4000/api/auth/google", body);
      console.log("User signed up/sign in with Google successfully:", response.data);
      dispatch(signInSuccess(response.data.data));

      showToast("User is signed up!", "success");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      dispatch(signInFailure( "Something went wrong with Google OAuth"));
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
