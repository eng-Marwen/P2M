import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { showToast } from "../popups/tostHelper.js";
import { supabase } from "../supabaseClient";
import axios from "axios";
import { signInSuccess } from "../app/user/userSlice.js";

const Profile = () => {
  const dispatch = useDispatch();

  //---supabase image upload setup---
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const currentUser = useSelector((state) => state.user.currentUser);
  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const uploadImage = async () => {
    console.log(file);
    if (!file) return;

    setUploading(true);
    try {
      // Create unique filename to avoid conflicts
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(`public/${fileName}`, file);

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(`public/${fileName}`);

      setUrl(publicUrlData.publicUrl);
      console.log("Upload successful:", publicUrlData.publicUrl);
      setFile(null);
      return publicUrlData.publicUrl; // Return the URL
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Upload failed: " + error.message, "error");
    } finally {
      setUploading(false);
    }
  };
  //---end supabase image upload setup---
  const fileInputRef = useRef(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let avatarUrl = url || currentUser?.avatar;

      // Upload image first if there's a new file
      if (file) {
        avatarUrl = await uploadImage();
      }

      // Prepare update data
      const updateData = {
        ...formData,
        avatar: avatarUrl,
      };

      // Remove empty fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === "" || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log("Update data:", updateData);

      // Send to backend
      const response = await axios.patch("http://localhost:4000/api/auth/update-profile", updateData)


      if (response.data.status === "success") {
        showToast("Profile updated successfully!", "success");

        dispatch(signInSuccess(response.data.data));
      }
    } catch (error) {
      console.error("Update error:", error);
      const message = error.response?.data?.message || "Update failed";
      showToast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto p-3 max-w-lg ">
      <h1 className="text-3xl text-center font-semiboldbold my-7">Profile </h1>

      <form className="flex flex-col gap-4   ">
        <input
          type="file"
          hidden
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <img
          src={url || currentUser?.avatar}
          alt={currentUser?.username || "profile"}
          onClick={() => fileInputRef.current.click()}
          className="w-24 h-24 mt-2 self-center rounded-full object-cover cursor-pointer"
        />
        {file && (
          <p className="text-center text-sm text-gray-600">
            Selected: {file.name}
          </p>
        )}
        <input
          type="text"
          placeholder={currentUser?.username}
          className=" border border-gray-300 p-2 rounded-lg mb-2"
          id="username"
          onChange={handleInputChange}
        />
        <input
          type="password"
          placeholder="Current Password"
          className="border border-gray-300 p-2 rounded-lg mb-2 "
          id="currentPassword"
          onChange={handleInputChange}
        />
        <input
          type="password"
          placeholder="New Password"
          className="border border-gray-300 p-2 rounded-lg mb-2"
          id="password"
          onChange={handleInputChange}
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-slate-700 text-white p-3 uppercase rounded-lg
          hover:opacity-95 disabled:opacity-80 
        "
          onClick={handleUpdateProfile}
        >
          {uploading ? "Uploading..." : "Update Profile"}
        </button>
      </form>
      <div className="flex justify-between mt-4">
        <span className="text-red-700 cursor-pointer">Delete Account</span>
        <span className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;
