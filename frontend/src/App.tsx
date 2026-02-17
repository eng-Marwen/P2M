import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { signOut } from "./app/user/userSlice";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import { ENV } from "./config/env";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import CreateHouse from "./pages/CreateHouse";
import EditListing from "./pages/EditListing";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Listing from "./pages/Listing";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Search from "./pages/Search";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyResetOtp from "./pages/VerifyResetOtp";

// Set default config for all axios requests
const API_URL = ENV.API_URL;

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

console.log("🔗 Backend URL:", API_URL, "| Mode:", import.meta.env.MODE);

// Component to setup axios interceptor
function AxiosInterceptor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Setup response interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Pass through successful responses
      (error) => {
        // Check if error response status is 401 (Unauthorized)
        if (error.response?.status === 401) {
          const errorMessage =
            error.response?.data?.message?.toLowerCase() || "";

          // Check if it's a token expiration or invalid token error
          if (
            errorMessage.includes("token expired") ||
            errorMessage.includes("invalid token") ||
            errorMessage.includes("unauthorized")
          ) {
            // Clear user state
            dispatch(signOut());

            // Redirect to sign-in page
            navigate("/sign-in", { replace: true });
          }
        }

        // Always reject the error so it can be caught by the calling code
        return Promise.reject(error);
      },
    );

    // Cleanup function to remove interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AxiosInterceptor />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/listing/:id" element={<Listing />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-house" element={<CreateHouse />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
        </Route>
        <Route path="/search" element={<Search />} />
        <Route path="/verify-email" element={<EmailVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
