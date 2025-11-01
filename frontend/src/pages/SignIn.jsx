import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import OAuth from "../components/OAuth.jsx";
import { showToast } from "../popups/tostHelper.js";
import { signInSuccess, signInFailure } from "../app/user/userSlice.js";  
import { useDispatch } from "react-redux";

const SignIn = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });

    console.log(formData);
  };
  const navigate = useNavigate();
  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:4000/api/auth/signin", formData)
      .then((response) => {
        console.log("User signed in successfully:", response.data);
        showToast("User is signed in!", "success");
        dispatch(signInSuccess(response.data.data));
        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((error) => {
        dispatch(signInFailure( "Something went wrong"));
        console.error("There was an error signing up!", error);
        const message =
          error.response?.data?.message || // if your backend sends { message: "..." }
          error.response?.data || // if backend sends plain text
          error.message || // fallback from axios
          "Something went wrong";
        console.log(message);
        showToast(message, "error");
      });
  };

  return (
    <div className="p-3 max-w-lg mx-auto ">
      <h1 className="text-2xl text-center font-semibold my-7">Sign In </h1>
      <form className="flex flex-col  gap-4 rounded">
        <input
          onChange={handFormChange}
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="email"
        />
        <input
          onChange={handFormChange}
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="password"
        />
        <button
          onClick={handleFormSubmit}
          className="bg-slate-700 text-white p-3 uppercase rounded-lg
          hover:opacity-95 disabled:opacity-80
        "
        >
          SIGN IN
        </button>
        <OAuth />
      </form>
      <div className=" flex gap-2 pt-5">
        <p>Already have an account? </p>
        <Link to="/sign-up" className="text-blue-700 underline">
          Sign up
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignIn;
