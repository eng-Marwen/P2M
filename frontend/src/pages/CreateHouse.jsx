import { useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import { showToast } from "../popups/tostHelper.js";
import { supabase } from "../supabaseClient";

const CreateHouse = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null); // Add ref for file input

  const handleUploadImages = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      showToast("Please select at least one image", "error");
      return;
    }

    // Check if total uploaded + current selection exceeds 6
    if (uploadedImages.length + files.length > 6) {
      showToast(
        `You can only have a maximum of 6 images total per listing. You currently have ${uploadedImages.length} uploaded.`,
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

      // Add new uploads to existing uploaded images
      setUploadedImages((prev) => [...prev, ...uploadResults]);
      console.log("New images uploaded:", uploadResults);

      // Clear files after successful upload but keep uploaded images
      setFiles([]);

      // Reset file input using ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showToast(`${uploadResults.length} image${uploadResults.length > 1 ? "s" : ""} uploaded successfully!`, "success");
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

      const uploadToSupabase = async () => {
        try {
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}-${file.name}`;

          const { error } = await supabase.storage
            .from("houses")
            .upload(`public/${fileName}`, file);

          if (error) {
            throw error;
          }

          const { data: publicUrlData } = supabase.storage
            .from("houses")
            .getPublicUrl(`public/${fileName}`);

          console.log("Upload successful:", publicUrlData.publicUrl);

          resolve({
            url: publicUrlData.publicUrl,
            fileName: fileName,
          });
        } catch (error) {
          console.error("Upload error:", error);
          reject(error);
        }
      };

      uploadToSupabase();
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Check if total would exceed 6 (existing files + uploaded images + new selection)
    if (uploadedImages.length + files.length + selectedFiles.length > 6) {
      showToast(
        `You can only select ${
          6 - uploadedImages.length - files.length
        } more images. You currently have ${
          uploadedImages.length
        } uploaded and ${files.length} selected.`,
        "error"
      );
      // Reset the file input
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
      alert("Please select only image files");
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Add new files to existing files instead of replacing
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);

    // Reset the file input to allow selecting the same files again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUploadedImage = async (indexToRemove) => {
    const imageToRemove = uploadedImages[indexToRemove];

    try {
      const { error } = await supabase.storage
        .from("houses")
        .remove([`public/${imageToRemove.fileName}`]);

      if (error) {
        console.error("Error deleting from Supabase:", error);
        showToast("Failed to delete image from storage", "error");
        return;
      }

      const updatedImages = uploadedImages.filter(
        (_, index) => index !== indexToRemove
      );
      setUploadedImages(updatedImages);
      console.log("Image deleted successfully:", imageToRemove.fileName);
      showToast("Image deleted successfully", "success");
    } catch (error) {
      console.error("Error removing image:", error);
      showToast("Failed to delete image", "error");
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

  return (
    <main className="p-3 max-w-4xl mx-auto">
      {" "}
      {/* Increased max-width */}
      <h1 className="text-3xl font-semibold my-7 text-center">
        Create New House Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-6">
        {" "}
        {/* Fixed responsive classes */}
        {/* Left side - Form fields */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            required
            maxLength={62}
            minLength={6}
            id="name"
            className="border bg-white border-gray-300 p-2 rounded-lg"
          />
          <textarea
            placeholder="Description"
            required
            maxLength={500}
            minLength={20}
            id="description"
            className="border bg-white border-gray-300 p-2 rounded-lg"
          ></textarea>

          <input
            type="text"
            required
            placeholder="Address"
            id="address"
            className="border bg-white border-gray-300 p-2 rounded-lg"
          />

          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sell</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
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
                className="border bg-white border-gray-300 w-16 p-2 rounded-lg"
              />
              <p>Baths</p>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                required
                min={1}
                id="regularPrice"
                className="border bg-white border-gray-300 w-24 p-2 rounded-lg"
              />
              <div className="flex flex-col">
                <p>Regular Price</p>
                <span className="text-xs opacity-80">($ / Month)</span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                required
                min={1}
                id="discountedPrice"
                className="border bg-white border-gray-300 w-24 p-2 rounded-lg"
              />
              <div className="flex flex-col">
                <p>Discounted Price</p>
                <span className="text-xs opacity-80">($ / Month)</span>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 uppercase font-semibold"
          >
            Create Listing
          </button>
        </div>
        {/* Right side - Images section */}
        <div className="flex flex-col gap-4 flex-1 sm:max-w-md">
          {" "}
          {/* Added max width for right side */}
          <div className="flex flex-col">
            <p className="font-semibold text-lg">
              Images:{" "}
              <span className="opacity-65 ml-2 font-normal">
                The first image will be the cover (max: 6)
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Uploaded: {uploadedImages.length}/6 | Selected: {files.length}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploadedImages.length + files.length >= 6}
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
          {/* Show uploaded images */}
          {uploadedImages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Uploaded images ({uploadedImages.length}/6):
              </p>
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((imageData, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageData.url}
                      alt={`House ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Delete from storage"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black bg-opacity-50 text-center py-1 rounded-b">
                      {index === 0 ? "(Cover)" : `Image ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
      <ToastContainer />
    </main>
  );
};

export default CreateHouse;
