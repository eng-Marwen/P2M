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
  const [loadingListings, setLoadingListings] = useState(false);

  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const currentUser = useSelector((state) => state.user.currentUser);
  // initialize form with current user values (if available)
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    address: currentUser?.address || "",
    phone: currentUser?.phone || "",
    currentPassword: "",
    password: "",
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
      const result = await uploadToCloudinary(file, { folder: "avatars" });
      setUrl(result.secure_url);
      setFile(null);
      return result.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Upload failed: " + (error.message || "unknown"), "error");
      return null;
    } finally {
      setUploading(false);
    }
  };
  const fileInputRef = useRef(null);

  const handleUpdateProfile = async (e) => {
    e?.preventDefault();
    setUploading(true);

    try {
      let avatarUrl = url || currentUser?.avatar;

      // Upload image first if there's a new file
      if (file) {
        const uploaded = await uploadImage();
        if (uploaded) avatarUrl = uploaded;
      }

      const updateData = {
        username: formData.username,
        address: formData.address,
        phone: formData.phone,
        avatar: avatarUrl,
      };

      // Remove empty fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === "" || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const response = await axios.patch(
        "/api/auth/update-profile",
        updateData,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success" || response.status === 200) {
        showToast("Profile updated successfully!", "success");
        dispatch(signInSuccess(response.data.data));
        const returnedAvatar = response.data.data?.avatar;
        if (returnedAvatar) setUrl(returnedAvatar);
        setShowEdit(false);
      } else {
        showToast("Update returned unexpected response", "error");
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
      const response = await axios.delete("/api/auth/delete", {
        withCredentials: true,
      });
      if (response.data.status === "success") {
        showToast("Account deleted successfully!", "success");
        dispatch(signOut());
        setTimeout(() => {
          navigate("/sign-in");
        }, 1000);
      }
    } catch (error) {
      console.error("Delete error:", error);
      const message = error.response?.data?.message || "Delete failed";
      showToast(message, "error");
    }
  };

  const handleShowListings = async () => {
    try {
      setLoadingListings(true);
      const response = await axios.get(`/api/houses/${currentUser._id}`, {
        withCredentials: true,
      });
      setUserListings(response.data.data || []);
      setLoadingListings(false);
    } catch (error) {
      setLoadingListings(false);
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
      const response = await axios.delete(`/api/houses/${listingId}`, {
        withCredentials: true,
      });
      if (response.data.status === "success") {
        showToast("Listing deleted successfully!", "success");
        setUserListings((prev) =>
          prev.filter((listing) => listing._id !== listingId)
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
        { withCredentials: true }
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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile section */}
        <aside className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center text-center gap-3">
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
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full object-cover cursor-pointer ring-2 ring-indigo-100"
              onError={(e) => {
                e.target.src = "/placeholder-profile.png";
              }}
            />
            <div className="text-lg font-semibold text-gray-900">
              {currentUser?.username || "User"}
            </div>
            <div className="text-sm text-gray-500">{currentUser?.email}</div>

            <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="font-bold text-indigo-600">
                  {userListings.length}
                </div>
                <div className="text-gray-500">Listings</div>
              </div>
              <div>
                <div className="font-bold text-indigo-600">—</div>
                <div className="text-gray-500">Favorites</div>
              </div>
              <div>
                <div className="font-bold text-indigo-600">—</div>
                <div className="text-gray-500">Views</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => setShowEdit((s) => !s)}
              className="w-full px-4 py-2 bg-black/4 text-black border border-black rounded-md ">
              {showEdit ? "Close Edit" : "Edit Profile"}
            </button>


            <button
              onClick={handleShowListings}
              className="w-full px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              {loadingListings ? "Loading..." : "Show My Listings"}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-sm text-red-600 border rounded-md hover:bg-red-50"
            >
              Sign Out
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>

          {/* Edit form (collapsible) */}
          {showEdit && (
            <form className="mt-4 space-y-3" onSubmit={handleUpdateProfile}>
              <input
                type="text"
                id="username"
                placeholder={currentUser?.username || "Username"}
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                id="address"
                placeholder={currentUser?.address || "Address (optional)"}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="tel"
                id="phone"
                placeholder={currentUser?.phone || "Phone (optional)"}
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-3 py-2  border border-indigo-600 text-indigo-600 rounded-md bg-indigo-50"
                >
                  {uploading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEdit(false);
                    setFile(null);
                  }}
                  className="flex-1 px-3 py-2 bg-black/5 border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </aside>

        {/* Listings / Dashboard section */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
            <div className="text-sm text-gray-500">
              {loadingListings
                ? "Loading..."
                : `${userListings.length} item(s)`}
            </div>
          </div>

          {loadingListings && (
            <div className="p-6 bg-white rounded-lg shadow text-center">
              Loading listings...
            </div>
          )}

          {!loadingListings && userListings.length === 0 && (
            <div className="p-6 bg-white rounded-lg shadow text-center">
              <p className="text-gray-600">You have no listings yet.</p>
              <Link
                to="/create-house"
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Create your first listing
              </Link>
            </div>
          )}

          {!loadingListings && userListings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex gap-4"
                >
                  <img
                    src={listing.images?.[0] || "/placeholder-house.jpg"}
                    alt={listing.name}
                    className="w-28 h-20 rounded-md object-cover shrink-0"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-gray-800 truncate">
                        {listing.name}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          listing.type === "rent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {listing.type === "rent" ? "For Rent" : "For Sale"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                      📍 {listing.address}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="text-xs text-gray-500">
                        🛏 {listing.bedrooms} • 🚿 {listing.bathrooms}{" "}
                        {listing.area !== undefined &&
                          listing.area !== null &&
                          listing.area !== "" && <>• 📐 {listing.area} m²</>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/edit-listing/${listing._id}`)
                          }
                          className="px-2 py-1 text-xs border rounded text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteListing(listing._id)}
                          className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Profile;
