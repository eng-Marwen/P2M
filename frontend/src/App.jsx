import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import About from "./pages/About";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import EditListing from "./pages/EditListing";
import EmailVerification from "./pages/EmailVerification";
import PrivateRoute from "./components/PrivateRoute";
import axios from 'axios';
import CreateHouse from "./pages/CreateHouse";
import Listing from "./pages/Listing";
import Search from "./pages/Search";
import ContactUs from "./pages/ContactUs";

// Set default config for all axios requests
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:4000';
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
