import axios from "axios";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
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
import { ENV } from "./config/env";

// Set default config for all axios requests
const API_URL =ENV.API_URL

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

console.log("🔗 Backend URL:", API_URL, "| Mode:", import.meta.env.MODE);

function App() {
  return (
    <BrowserRouter>
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
