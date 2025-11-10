import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { uploadToCloudinary } from "../lib/cloudinary";
import { showToast } from "../popups/tostHelper.js";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    type: "",
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    area: "", // <-- optional area (m²), keep empty string when not set
  });

  // Image states
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Add this for existing images
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  // Helper: extract Cloudinary public_id from a secure_url
  const extractPublicIdFromUrl = (url) => {
    try {
      if (!url || !url.includes("/res.cloudinary.com/")) return null;
      // Match everything after /upload/ optionally skipping version like v123456789/
      // and strip the file extension and any query string
      const m = url.match(
        /\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|gif|webp|bmp|tiff)(?:$|\?)/i
      );
      if (!m || !m[1]) return null;
      return decodeURIComponent(m[1]);
    } catch (err) {
      console.error("extractPublicIdFromUrl error:", err);
      return null;
    }
  };

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        console.log("Fetching listing with ID:", id);

        // Update the API endpoint to match your backend
        const response = await axios.get(
          `http://localhost:4000/api/houses/house/${id}`,
          {
            withCredentials: true,
          }
        );

        console.log("Full response:", response.data);

        const listingData = response.data.data;
        setListing(listingData);

        // Populate form data (include optional area)
        setFormData({
          name: listingData.name || "",
          description: listingData.description || "",
          address: listingData.address || "",
          type: listingData.type || "",
          parking: listingData.parking || false,
          furnished: listingData.furnished || false,
          offer: listingData.offer || false,
          bedrooms: listingData.bedrooms || 1,
          bathrooms: listingData.bathrooms || 1,
          regularPrice: listingData.regularPrice || 50,
          discountedPrice: listingData.discountedPrice || 0,
          area:
            typeof listingData.area === "number"
              ? listingData.area
              : listingData.area || "", // keep '' when absent
        });

        // Set existing images
        if (listingData.images && listingData.images.length > 0) {
          const existingImagesData = listingData.images.map(
            (imageUrl, index) => ({
              url: imageUrl,
              id: `existing-${index}`, // Give them unique IDs
              isExisting: true, // Flag to identify existing images
              // attempt to derive Cloudinary publicId from the stored URL
              publicId: extractPublicIdFromUrl(imageUrl),
            })
          );
          setExistingImages(existingImagesData);
          console.log("Existing images loaded:", existingImagesData);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        const message =
          error.response?.data?.message || "Failed to load listing";
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Get total images count (existing + newly uploaded)
  const getTotalImagesCount = () => {
    return existingImages.length + uploadedImages.length;
  };

  // --- Replace previous cleanup useCallback + effect with ref-based one-time listeners ---
  // Keep refs in sync so unload handlers see the latest state without re-subscribing
  const uploadedImagesRef = useRef(uploadedImages);
  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  const formSubmittedRef = useRef(formSubmitted);
  useEffect(() => {
    formSubmittedRef.current = formSubmitted;
  }, [formSubmitted]);

  const cleanupUploadedImagesOnUnload = async () => {
    const imgs = uploadedImagesRef.current;
    if (!imgs || imgs.length === 0 || formSubmittedRef.current) return;

    console.log("Cleaning up uploaded images (unload)...");

    const deletePromises = imgs.map((img) => {
      if (!img?.publicId) return Promise.resolve();
      return axios
        .post(
          "http://localhost:4000/api/cloudinary/delete",
          { publicId: img.publicId },
          { withCredentials: true }
        )
        .then((res) => {
          console.log("Deleted remote image:", img.publicId, res.data);
        })
        .catch((err) => {
          console.warn(
            "Could not delete remote image during unload:",
            img.publicId,
            err?.message || err
          );
        });
    });

    await Promise.all(deletePromises);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (uploadedImagesRef.current.length > 0 && !formSubmittedRef.current) {
        // best-effort async cleanup (may not complete in all browsers)
        cleanupUploadedImagesOnUnload();
        const message =
          "You have uploaded images that will be deleted if you leave.";
        event.returnValue = message;
        return message;
      }
    };

    const handleUnload = () => {
      // best-effort cleanup on page unload
      cleanupUploadedImagesOnUnload();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    setFormData((prev) => {
      if (id === "sale" && checked) {
        return { ...prev, type: "sale" };
      } else if (id === "rent" && checked) {
        return { ...prev, type: "rent" };
      } else if (id === "sale" && !checked) {
        return { ...prev, type: "rent" };
      } else if (id === "rent" && !checked) {
        return { ...prev, type: "sale" };
      } else if (type === "checkbox") {
        return { ...prev, [id]: checked };
      } else if (type === "number") {
        // area is optional: keep empty string if cleared, otherwise convert to number
        if (id === "area") {
          return { ...prev, area: value === "" ? "" : Number(value) };
        }
        // other numeric fields: keep numeric (fallback to 0)
        return { ...prev, [id]: Number(value) || 0 };
      } else {
        return { ...prev, [id]: value };
      }
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalImages = getTotalImagesCount();

    // Check if total would exceed 6
    if (totalImages + files.length + selectedFiles.length > 6) {
      showToast(
        `You can only select ${
          6 - totalImages - files.length
        } more images. You currently have ${totalImages} images.`,
        "error"
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate that all files are images
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      showToast("Please select only image files", "error");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadImages = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      showToast("Please select at least one image", "error");
      return;
    }

    const totalImages = getTotalImagesCount();
    if (totalImages + files.length > 6) {
      showToast(
        `You can only have a maximum of 6 images total per listing. You currently have ${totalImages} images.`,
        "error"
      );
      return;
    }

    setUploading(true);
    try {
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(uploadImage(files[i]));
      }

      const uploadResults = await Promise.all(promises);
      setUploadedImages((prev) => [...prev, ...uploadResults]);
      console.log("New images uploaded:", uploadResults);

      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showToast(
        `${uploadResults.length} image${
          uploadResults.length > 1 ? "s" : ""
        } uploaded successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Some images failed to upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }

      const uploadToCloudinaryWrapper = async () => {
        try {
          // Use the same helper as Profile.jsx
          // put uploads in a folder for listings
          const result = await uploadToCloudinary(file, { folder: "houses" });
          // Expect result to include secure_url and public_id (same shape used in Profile.jsx)
          if (!result || !result.secure_url || !result.public_id) {
            throw new Error("Invalid upload response from Cloudinary helper");
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } catch (error) {
          reject(error);
        }
      };

      uploadToCloudinaryWrapper();
    });
  };

  // Remove existing image (delete from Cloudinary when possible)
  const removeExistingImage = async (indexToRemove) => {
    const imageData = existingImages[indexToRemove];
    if (!imageData) {
      showToast("Image not found", "error");
      return;
    }

    const { publicId } = imageData;

    // If we cannot determine a Cloudinary publicId, just remove locally
    if (!publicId) {
      setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
      showToast(
        "Image removed from listing (not a Cloudinary asset)",
        "success"
      );
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/api/cloudinary/delete",
        { publicId },
        { withCredentials: true }
      );

      const ok =
        res.status === 200 ||
        res.data?.status === "success" ||
        res.data?.result === "ok" ||
        res.data?.result === "not found";

      if (ok) {
        setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
        showToast(
          "Image deleted from Cloudinary and removed from listing",
          "success"
        );
      } else {
        console.error("Cloudinary delete response:", res.data);
        showToast("Failed to delete image from storage", "error");
      }
    } catch (error) {
      console.error("Error deleting existing image from Cloudinary:", error);

      const status = error.response?.status;
      if (status === 404) {
        // Already gone on Cloudinary — remove locally
        setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
        showToast("Image not found on Cloudinary — removed locally", "warning");
        return;
      }

      showToast(
        error.response?.data?.message ||
          "Failed to delete image from Cloudinary. See console for details.",
        "error"
      );
    }
  };

  // Remove uploaded image (and delete from Cloudinary)
  const removeUploadedImage = async (indexToRemove) => {
    const imageToRemove = uploadedImages[indexToRemove];

    if (!imageToRemove) {
      showToast("Image not found", "error");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/api/cloudinary/delete",
        { publicId: imageToRemove.publicId },
        { withCredentials: true }
      );

      // backend should return success info
      if (res.status === 200) {
        const updatedImages = uploadedImages.filter(
          (_, index) => index !== indexToRemove
        );
        setUploadedImages(updatedImages);
        showToast("Image deleted successfully", "success");
      } else {
        console.error("Cloudinary delete response:", res.data);
        showToast("Failed to delete image from storage", "error");
      }
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      showToast("Failed to delete image from storage", "error");
    }
  };

  const removeSelectedFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
  };

  const clearAllSelected = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.name.length < 6) {
      showToast("House name must be at least 6 characters", "error");
      return;
    }

    if (!formData.description || formData.description.length < 20) {
      showToast("Description must be at least 20 characters", "error");
      return;
    }

    if (!formData.address) {
      showToast("Please enter an address", "error");
      return;
    }

    if (!formData.type) {
      showToast("Please select either Sale or Rent", "error");
      return;
    }

    // Check if we have at least one image (existing or newly uploaded)
    const totalImages = existingImages.length + uploadedImages.length;
    if (totalImages === 0) {
      showToast("Please keep at least one image", "error");
      return;
    }

    if (formData.offer && formData.discountedPrice >= formData.regularPrice) {
      showToast("Discounted price must be less than regular price", "error");
      return;
    }

    // Optional area validation: if provided ensure it's positive number
    if (
      formData.area !== "" &&
      (isNaN(Number(formData.area)) || Number(formData.area) < 0)
    ) {
      showToast("Area must be a positive number or left empty", "error");
      return;
    }

    setCreating(true);

    try {
      // Combine existing and newly uploaded images
      const allImages = [
        ...existingImages.map((img) => img.url),
        ...uploadedImages.map((img) => img.url),
      ];

      // Prepare payload
      const houseData = {
        ...formData,
        images: allImages,
        // ensure numeric fields are numbers
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        regularPrice: Number(formData.regularPrice) || 0,
        discountedPrice:
          formData.offer && formData.discountedPrice !== ""
            ? Number(formData.discountedPrice) || 0
            : undefined,
      };

      // Normalize optional area: send numeric value or omit the field entirely
      if (Object.prototype.hasOwnProperty.call(houseData, "area")) {
        if (
          houseData.area === "" ||
          houseData.area === null ||
          houseData.area === undefined
        ) {
          delete houseData.area;
        } else {
          const areaNum = Number(houseData.area);
          if (!Number.isNaN(areaNum)) {
            houseData.area = areaNum;
          } else {
            delete houseData.area;
          }
        }
      }

      // If offer is false remove discountedPrice to avoid sending invalid data
      if (
        !houseData.offer &&
        Object.prototype.hasOwnProperty.call(houseData, "discountedPrice")
      ) {
        delete houseData.discountedPrice;
      }

      console.log("Updating house data:", houseData);

      // Use PATCH for updating
      const response = await axios.patch(
        `http://localhost:4000/api/houses/${id}`,
        houseData,
        {
          withCredentials: true,
        }
      );

      console.log("Server response:", response.data);

      if (response.data && (response.data.success || response.status === 200)) {
        setFormSubmitted(true);
        showToast("House listing updated successfully!", "success");

        // Navigate back to profile after a short delay
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } else {
        throw new Error(response.data?.message || "Failed to update listing");
      }
    } catch (error) {
      console.error("Error updating house listing:", error);

      let errorMessage = "Failed to update house listing";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      showToast(errorMessage, "error");
      setFormSubmitted(false);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="p-3 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <div className="text-lg">Loading listing data...</div>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="p-3 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <div className="text-lg text-red-600">Listing not found</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold my-7 text-center">
        Edit House Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-6">
        {/* Left side - Form fields */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            required
            maxLength={62}
            minLength={6}
            id="name"
            value={formData.name}
            className="border bg-white border-gray-300 p-2 rounded-lg"
            onChange={handleChange}
          />
          <textarea
            placeholder="Description"
            required
            maxLength={500}
            minLength={20}
            id="description"
            value={formData.description}
            className="border bg-white border-gray-300 p-2 rounded-lg"
            onChange={handleChange}
          ></textarea>

          <input
            type="text"
            required
            placeholder="Address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className="border bg-white border-gray-300 p-2 rounded-lg"
          />

          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                checked={formData.type === "sale"}
                className="w-5"
                onChange={handleChange}
              />
              <span>Sell</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                checked={formData.type === "rent"}
                className="w-5"
                onChange={handleChange}
              />
              <span>Rent</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                checked={formData.parking}
                className="w-5"
                onChange={handleChange}
              />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                checked={formData.furnished}
                className="w-5"
                onChange={handleChange}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                checked={formData.offer}
                className="w-5"
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                required
                min={1}
                max={10}
                id="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="border bg-white border-gray-300 w-16 p-2 rounded-lg"
              />
              <p>Beds</p>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                required
                min={1}
                max={10}
                id="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="border bg-white border-gray-300 w-16 p-2 rounded-lg"
              />
              <p>Baths</p>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                required
                min={50}
                id="regularPrice"
                value={formData.regularPrice}
                onChange={handleChange}
                className="border bg-white border-gray-300 w-24 p-2 rounded-lg"
              />
              <div className="flex flex-col">
                <p>Regular Price</p>
                <span className="text-xs opacity-80">($ / Month)</span>
              </div>
            </div>

            {formData.offer && (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  required
                  min={0}
                  id="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  className="border bg-white border-gray-300 w-24 p-2 rounded-lg"
                />
                <div className="flex flex-col">
                  <p>Discounted Price</p>
                  <span className="text-xs opacity-80">($ / Month)</span>
                </div>
              </div>
            )}

            {/* Optional area field */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                id="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Area (m²) - optional"
                className="border bg-white border-gray-300 w-28 p-2 rounded-lg"
              />
              <p>Area (m²)</p>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 uppercase font-semibold"
            onClick={handleSubmitForm}
          >
            {creating ? "Updating Listing..." : "Update Listing"}
          </button>
        </div>

        {/* Right side - Images section */}
        <div className="flex flex-col gap-4 flex-1 sm:max-w-md">
          <div className="flex flex-col">
            <p className="font-semibold text-lg">
              Images:{" "}
              <span className="opacity-65 ml-2 font-normal">
                The first image will be the cover (max: 6)
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Total: {getTotalImagesCount()}/6 | New uploads:{" "}
              {uploadedImages.length} | Selected: {files.length}
            </p>
          </div>

          {/* File upload section */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={getTotalImagesCount() + files.length >= 6}
              className="flex-1 border border-gray-300 p-3 rounded-lg bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-gray-700 file:bg-slate-100 file:border file:text-slate-700 hover:file:bg-slate-200 cursor-pointer disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleUploadImages}
              disabled={uploading || files.length === 0}
              className="text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 disabled:opacity-50 whitespace-nowrap"
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </button>
          </div>

          {/* Show selected files */}
          {files.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-blue-700 font-medium">
                  Selected files ({files.length}):
                </p>
                <button
                  type="button"
                  onClick={clearAllSelected}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex justify-between items-center text-xs text-blue-600"
                  >
                    <span className="truncate">• {file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show existing images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-blue-700">
                Current images ({existingImages.length}):
              </p>
              <div className="grid grid-cols-2 gap-2">
                {existingImages.map((imageData, index) => (
                  <div key={imageData.id} className="relative">
                    <img
                      src={imageData.url}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-20 object-cover rounded border-2 border-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Remove from listing"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 text-xs text-white bg-blue-600 bg-opacity-80 text-center py-1 rounded-b">
                      {index === 0 ? "(Cover)" : `Image ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show newly uploaded images */}
          {uploadedImages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-green-700">
                Newly uploaded images ({uploadedImages.length}):
              </p>
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((imageData, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageData.url}
                      alt={`New ${index + 1}`}
                      className="w-full h-20 object-cover rounded border-2 border-green-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Delete from storage"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 text-xs text-white bg-green-600 bg-opacity-80 text-center py-1 rounded-b">
                      New {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show message if no images */}
          {existingImages.length === 0 && uploadedImages.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border">
              <p className="text-gray-600">No images currently</p>
              <p className="text-sm text-gray-500">Upload at least one image</p>
            </div>
          )}
        </div>
      </form>
      <ToastContainer />
    </main>
  );
};

export default EditListing;
