import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { uploadToCloudinary } from "../lib/cloudinary";
import { showToast } from "../popups/tostHelper";

interface FormData {
  name: string;
  description: string;
  address: string;
  type: "sale" | "rent" | "";
  parking: boolean;
  furnished: boolean;
  offer: boolean;
  bedrooms: number;
  bathrooms: number;
  regularPrice: number;
  discountedPrice: number;
  area: string | number;
}

interface UploadedImage {
  url: string;
  publicId: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  house?: {
    _id: string;
  };
}

const CreateHouse = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
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
      area: "",
    },
  });

  // Watch form values
  const formData = watch();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedImagesRef = useRef<UploadedImage[]>(uploadedImages);

  // keep ref in sync with state so unmount cleanup sees latest images
  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  // keep a ref for formSubmitted to avoid adding it to effect deps
  const formSubmittedRef = useRef<boolean>(formSubmitted);
  useEffect(() => {
    formSubmittedRef.current = formSubmitted;
  }, [formSubmitted]);

  // Run cleanup only on component unmount. Uses refs to read latest state,
  // so we don't re-subscribe or trigger cleanup on every uploadedImages change.
  useEffect(() => {
    return () => {
      const imgs = uploadedImagesRef.current;
      if (!imgs || imgs.length === 0 || formSubmittedRef.current) return;

      // fire-and-forget async cleanup on unmount
      (async () => {
        console.log("Unmount: cleaning up uploaded images...");
        for (const img of imgs) {
          if (!img?.publicId) continue;
          try {
            await axios.post(
              "/api/cloudinary/delete",
              { publicId: img.publicId },
              { withCredentials: true },
            );
            console.log("Deleted remote image:", img.publicId);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn(
              "Could not delete remote image during unmount:",
              img.publicId,
              errorMsg,
            );
          }
        }
      })();
    };
    // run once on mount, cleanup runs on unmount
  }, []);

  // Handle checkbox changes for type (sale/rent) with React Hook Form
  const handleTypeChange = (newType: "sale" | "rent") => {
    setValue("type", newType, { shouldValidate: true });
  };

  const handleUploadImages = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (files.length === 0) {
      showToast("Please select at least one image", "error");
      return;
    }

    // Check if total uploaded + current selection exceeds 6
    if (uploadedImages.length + files.length > 6) {
      showToast(
        `You can only have a maximum of 6 images total per listing. You currently have ${uploadedImages.length} uploaded.`,
        "error",
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

      showToast(
        `${uploadResults.length} image${
          uploadResults.length > 1 ? "s" : ""
        } uploaded successfully!`,
        "success",
      );
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Some images failed to upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForm = async (data: FormData) => {
    // Add validation before submitting
    if (uploadedImages.length === 0) {
      showToast("Please upload at least one image", "error");
      return;
    }

    if (data.offer && data.discountedPrice >= data.regularPrice) {
      showToast("Discounted price must be less than regular price", "error");
      return;
    }

    setCreating(true);

    try {
      // Prepare data to send to backend - match your model exactly
      const houseData = {
        ...data,
        images: uploadedImages.map((img) => img.url),
      };

      console.log("Submitting house data:", houseData);

      const response = await axios.post<ApiResponse>("/api/houses", houseData, {
        withCredentials: true, // If using cookies for auth
      });

      console.log("Server response:", response.data);

      // Check if the response indicates success
      if (
        response.data &&
        (response.data.success ||
          response.status === 200 ||
          response.status === 201)
      ) {
        // Mark form as submitted so images won't be deleted
        setFormSubmitted(true);

        showToast("House listing created successfully!", "success");

        // Reset form after successful creation
        reset();
        setUploadedImages([]);

        // Optional: Navigate to the created listing or profile page
        // setTimeout(() => {
        //   navigate(`/house/${response.data.house._id}`);
        // }, 2000);
      } else {
        throw new Error(response.data?.message || "Failed to create listing");
      }
    } catch (error: unknown) {
      console.error("Error creating house listing:", error);

      // Handle different types of errors
      let errorMessage = "Failed to create house listing";

      // Check if it's an axios error by checking for response/request properties
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: ApiResponse; status: number };
          request?: unknown;
          message?: string;
        };
        if (axiosError.response) {
          // Server responded with error status
          errorMessage =
            axiosError.response.data?.message ||
            `Server error: ${axiosError.response.status}`;
        } else if (axiosError.request) {
          // Request was made but no response received
          errorMessage =
            "No response from server. Please check your connection.";
        } else {
          // Something else happened
          errorMessage = axiosError.message || "An unexpected error occurred";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
      setFormSubmitted(false); // Reset if submission failed
    } finally {
      setCreating(false);
    }
  };

  const uploadImage = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }

      // Upload to Cloudinary (unsigned preset) and return { url, publicId }
      (async () => {
        try {
          const result = await uploadToCloudinary(file, { folder: "houses" });
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } catch (err) {
          reject(err);
        }
      })();
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Check if total would exceed 6 (existing files + uploaded images + new selection)
    if (uploadedImages.length + files.length + selectedFiles.length > 6) {
      showToast(
        `You can only select ${
          6 - uploadedImages.length - files.length
        } more images. You currently have ${
          uploadedImages.length
        } uploaded and ${files.length} selected.`,
        "error",
      );
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate that all files are images
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (validFiles.length !== selectedFiles.length) {
      showToast("Please select only image files", "error");
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

  const removeUploadedImage = async (indexToRemove: number) => {
    const imageToRemove = uploadedImages[indexToRemove];

    try {
      if (imageToRemove.url && imageToRemove.publicId) {
        try {
          console.log("Deleting Cloudinary image:", imageToRemove.url);
          await axios.post(
            "/api/cloudinary/delete",
            { publicId: imageToRemove.publicId },
            { withCredentials: true },
          );
          console.log("Deleted Cloudinary image:", imageToRemove.url);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.warn(
            "Could not delete remote Cloudinary image (backend may be missing):",
            errorMsg,
          );
        }
      }

      const updatedImages = uploadedImages.filter(
        (_, index) => index !== indexToRemove,
      );
      setUploadedImages(updatedImages);
      showToast("Image removed", "success");
    } catch (error) {
      console.error("Error removing image:", error);
      showToast("Failed to delete image", "error");
    }
  };

  const removeSelectedFile = (indexToRemove: number) => {
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
      <h1 className="text-3xl font-semibold my-7 text-center">
        Create New House Listing
      </h1>
      <form
        className="flex flex-col sm:flex-row gap-6"
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        {/* Left side - Form fields */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Name field */}
          <div>
            <input
              type="text"
              placeholder="Name"
              maxLength={62}
              {...register("name", {
                required: "House name is required",
                minLength: {
                  value: 4,
                  message: "Name must be at least 4 characters",
                },
              })}
              className={`border bg-white p-2 rounded-lg w-full ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description field */}
          <div>
            <textarea
              placeholder="Description"
              maxLength={500}
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 20,
                  message: "Description must be at least 20 characters",
                },
              })}
              className={`border bg-white p-2 rounded-lg w-full ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Address field */}
          <div>
            <input
              type="text"
              placeholder="Address"
              {...register("address", {
                required: "Address is required",
              })}
              className={`border bg-white p-2 rounded-lg w-full ${
                errors.address
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Type selection with validation */}
          <div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="sale"
                  checked={formData.type === "sale"}
                  className="w-5"
                  onChange={() => handleTypeChange("sale")}
                />
                <span>Sell</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="rent"
                  checked={formData.type === "rent"}
                  className="w-5"
                  onChange={() => handleTypeChange("rent")}
                />
                <span>Rent</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="parking"
                  {...register("parking")}
                  className="w-5"
                />
                <span>Parking Spot</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="furnished"
                  {...register("furnished")}
                  className="w-5"
                />
                <span>Furnished</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="offer"
                  {...register("offer")}
                  className="w-5"
                />
                <span>Offer</span>
              </div>
            </div>
            {/* Hidden input for type validation */}
            <input
              type="hidden"
              {...register("type", {
                required: "Please select either Sale or Rent",
              })}
            />
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                max={10}
                {...register("bedrooms", {
                  required: "Bedrooms is required",
                  min: { value: 1, message: "At least 1 bedroom" },
                  max: { value: 10, message: "Maximum 10 bedrooms" },
                })}
                className={`border bg-white w-16 p-2 rounded-lg ${
                  errors.bedrooms ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p>Beds</p>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={1}
                max={10}
                {...register("bathrooms", {
                  required: "Bathrooms is required",
                  min: { value: 1, message: "At least 1 bathroom" },
                  max: { value: 10, message: "Maximum 10 bathrooms" },
                })}
                className={`border bg-white w-16 p-2 rounded-lg ${
                  errors.bathrooms ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p>Baths</p>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={50}
                {...register("regularPrice", {
                  required: "Regular price is required",
                  min: { value: 50, message: "Minimum price is $50" },
                })}
                className={`border bg-white w-24 p-2 rounded-lg ${
                  errors.regularPrice ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="flex flex-col">
                <p>Regular Price</p>
                <span className="text-xs opacity-80">($ / Month)</span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                {...register("discountedPrice", {
                  min: { value: 0, message: "Price must be positive" },
                })}
                className={`border bg-white w-24 p-2 rounded-lg ${
                  errors.discountedPrice ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="flex flex-col">
                <p>Discounted Price</p>
                <span className="text-xs opacity-80">($ / Month)</span>
              </div>
            </div>

            {/* Optional area field */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                {...register("area", {
                  min: { value: 0, message: "Area must be positive" },
                })}
                placeholder="Area (m²) - optional"
                className={`border bg-white w-28 p-2 rounded-lg ${
                  errors.area ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p>Area (m²)</p>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={creating}
            className="bg-black text-white font-semibold p-3 rounded-lg hover:opacity-95 uppercase disabled:opacity-50"
          >
            {creating ? "Creating Listing..." : "Create Listing"}
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
                      onError={(e) => {
                        console.error("Image load failed:", imageData.url);
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-house.jpg";
                      }}
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
    </main>
  );
};

export default CreateHouse;
