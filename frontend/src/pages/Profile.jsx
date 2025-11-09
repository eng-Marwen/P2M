import axios from "axios";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { signInSuccess, signOut } from "../app/user/userSlice.js";
import { uploadToCloudinary } from "../lib/cloudinary";
import { showToast } from "../popups/tostHelper.js";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userListings, setUserListings] = useState([]);

  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  // initialize form with current user values (if available)
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    address: currentUser?.address || "",
    phone: currentUser?.phone || "",
  });
  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const uploadImage = async () => {
    if (!file) return null;

    setUploading(true);
    try {
      // uploadToCloudinary returns { secure_url, public_id, raw }
      const result = await uploadToCloudinary(file, { folder: "avatars" });
      // store only the secure url string
      setUrl(result.secure_url);
      console.log("Upload successful:", result.secure_url);
      setFile(null);
      return result.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Upload failed: " + error.message, "error");
      return null;
    } finally {
      setUploading(false);
    }
  };
  const fileInputRef = useRef(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let avatarUrl = url || currentUser?.avatar;

      // Upload image first if there's a new file
      if (file) {
        const uploaded = await uploadImage();
        if (uploaded) avatarUrl = uploaded;
      }
      console.log("Avatar URL to use:", avatarUrl);

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
      const response = await axios.patch(
        "http://localhost:4000/api/auth/update-profile",
        updateData,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        showToast("Profile updated successfully!", "success");
        // ensure we dispatch the updated user object returned by backend
        dispatch(signInSuccess(response.data.data));
        // also update local preview url from returned user if available
        const returnedAvatar = response.data.data?.avatar;
        if (returnedAvatar) setUrl(returnedAvatar);
      } else {
        console.warn("Unexpected response:", response.data);
      }
    } catch (error) {
      console.error("Update error:", error);
      const message = error.response?.data?.message || "Update failed";
      showToast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:4000/api/auth/delete",
        {
          withCredentials: true, // Add this line
        }
      );
      if (response.data.status === "success") {
        showToast("Account deleted successfully!", "success");
        dispatch(signOut());
        setTimeout(() => {
          navigate("/sign-in");
        }, 1500); // Redirect to home or login page
      }
    } catch (error) {
      console.error("Delete error:", error);
      const message = error.response?.data?.message || "Delete failed";
      showToast(message, "error");
    }
  };
  const handleShowListings = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/houses/${currentUser._id}`,
        {
          withCredentials: true, // Add this line
        }
      );
      setUserListings(response.data.data);
    } catch (error) {
      console.error("Navigation error:", error);
      const message = error.response?.data?.message || "Navigation failed";
      showToast(message, "error");
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/houses/${listingId}`,
        {
          withCredentials: true, // Add this line
        }
      );
      if (response.data.status === "success") {
        showToast("Listing deleted successfully!", "success");
        // Refresh the listings
        setUserListings((prevListings) =>
          prevListings.filter((listing) => listing._id !== listingId)
        );
      }
    } catch (error) {
      console.error("Delete listing error:", error);
      const message = error.response?.data?.message || "Delete failed";
      showToast(message, "error");
    }
  };
  const handleSignOut = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        {
          withCredentials: true, // Add this line
        }
      );
      if (response.data.status === "success") {
        dispatch(signOut());
        navigate("/sign-in");
      }
    } catch (error) {
      console.error("Logout error:", error);
      const message = error.response?.data?.message || "Logging out failed";
      showToast(message, "error");
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
          src={encodeURI(
            url || currentUser?.avatar || "/placeholder-profile.png"
          )}
          alt={currentUser?.username || "profile"}
          onClick={() => fileInputRef.current.click()}
          className="w-24 h-24 mt-2 self-center rounded-full object-cover cursor-pointer"
          onError={(e) => {
            console.error("Avatar load failed:", e.target.src);
            e.target.src = "/placeholder-profile.png";
          }}
        />
        {file && (
          <p className="text-center text-sm text-gray-600">
            Selected: {file.name}
          </p>
        )}
        <input
          type="text"
          placeholder={currentUser?.username}
          className=" border border-gray-300 p-2 rounded-lg mb-2 bg-white"
          id="username"
          onChange={handleInputChange}
        />
        <input
          type="password"
          placeholder="Current Password"
          className="border border-gray-300 p-2 rounded-lg mb-2 bg-white"
          id="currentPassword"
          onChange={handleInputChange}
        />
        <input
          type="password"
          placeholder="New Password"
          className="border border-gray-300 p-2 rounded-lg mb-2 bg-white"
          id="password"
          onChange={handleInputChange}
        />
        {/* Address & Phone */}
        <input
          type="text"
          placeholder={currentUser?.address || "Address (optional)"}
          className="border border-gray-300 p-2 rounded-lg mb-2 bg-white"
          id="address"
          onChange={handleInputChange}
        />
        <input
          type="tel"
          placeholder={currentUser?.phone || "Phone (optional)"}
          className="border border-gray-300 p-2 rounded-lg mb-2 bg-white"
          id="phone"
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
        <Link
          to="/create-house"
          className="bg-green-900 text-center text-white p-3 uppercase rounded-lg
          hover:opacity-95 disabled:opacity-80 "
        >
          Create New House Listing
        </Link>
      </form>
      <div className="flex justify-between mt-4">
        <span
          onClick={handleDeleteAccount}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>
      <button
        onClick={handleShowListings}
        className="text-green-700 w-full my-2 text-lg hover:opacity-80"
      >
        Show My Listings
      </button>
      {userListings && userListings.length > 0 ? (
        <div className="space-y-4">
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="shrink-0">
                  <img
                    src={listing.images[0] || "/placeholder-house.jpg"}
                    alt={listing.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {listing.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.type === "rent"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {listing.type === "rent" ? "For Rent" : "For Sale"}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    📍 {listing.address}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>
                      🛏️ {listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}
                    </span>
                    <span>
                      🚿 {listing.bathrooms} bath
                      {listing.bathrooms > 1 ? "s" : ""}
                    </span>
                    {listing.parking && <span>🚗 Parking</span>}
                    {listing.furnished && <span>🪑 Furnished</span>}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/edit-listing/${listing._id}`)}
                        className="bg-transparent text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteListing(listing._id)}
                        className="bg-transparent text-red-800 border border-red-800 px-3 py-1 rounded text-sm hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No listings found.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default Profile;
