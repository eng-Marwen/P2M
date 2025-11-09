import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { signInFailure, signInSuccess } from "../app/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";
import { showToast } from "../popups/tostHelper.js";

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    address: "",
    phone: "",
  });

  const [load, setLoad] = useState(false);

  const handleFormSubmit = (e) => {
    setLoad(true);
    e.preventDefault();
    axios
      .post("http://localhost:4000/api/auth/signup", formData)
      .then((response) => {
        showToast("User created!", "success");
        dispatch(signInSuccess(response.data.data));
        setTimeout(() => {
          navigate("/");
        }, 1200);
      })
      .catch((error) => {
        dispatch(signInFailure("Signup failed"));
        const message =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Something went wrong";
        showToast(message, "error");
      });
    setLoad(false);
  };

  return (
    <div className="p-3 max-w-lg mx-auto ">
      <h1 className="text-2xl text-center font-semibold my-7">Sign Up </h1>
      <form className="flex flex-col  gap-4 rounded">
        <input
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          value={formData.email}
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="email"
        />
        <input
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          value={formData.username}
          type="text"
          placeholder="Username"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="username"
        />
        <input
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          value={formData.password}
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="password"
        />

        {/* New fields: address & phone */}
        <input
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          value={formData.address}
          type="text"
          placeholder="Address"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="address"
        />
        <input
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          value={formData.phone}
          type="tel"
          placeholder="Phone Number"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="phone"
        />

        <button
          onClick={handleFormSubmit}
          className="bg-slate-700 text-white p-3 uppercase rounded-lg
          hover:opacity-95 disabled:opacity-80
        "
        >
          {load ? "Loading..." : "Create Account"}
        </button>
        <OAuth />
      </form>
      <div className=" flex gap-2 pt-5">
        <p>Already have an account? </p>
        <Link to="/sign-in" className="text-blue-700 underline">
          Sign in
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
