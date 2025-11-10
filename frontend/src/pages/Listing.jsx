import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaBath,
  FaBed,
  FaCouch,
  FaMapMarkerAlt,
  FaParking,
  FaPhone,
  FaRulerCombined,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation } from "swiper/modules";
const Listing = () => {
  SwiperCore.use([Navigation]);
  const { id } = useParams();
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(null);
  const [showOwnerCard, setShowOwnerCard] = useState(false);

  useEffect(() => {
    console.log("useEffect triggered with id:", id);

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching listing data for ID:", id);

        const response = await axios.get(
          `http://localhost:4000/api/houses/house/${id}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.data) {
          setListingData(response.data.data);
        }
        console.log("Listing data fetched:", response.data.data);
      } catch (error) {
        console.error("Error fetching listing data:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch listing data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    } else {
      console.log("No ID provided");
      setLoading(false);
    }
  }, [id]);

  // helper: request smaller Cloudinary image without cropping (no c_fill)
  const transformCloudinaryUrlNoCrop = (url, width = 800) => {
    try {
      if (!url || !url.includes("/upload/")) return url;
      const token = "/upload/";
      const idx = url.indexOf(token);
      const before = url.slice(0, idx + token.length);
      const after = url.slice(idx + token.length);
      // w_<width>, q_auto, f_auto — no c_fill so aspect ratio preserved
      const transform = `w_${width},q_auto,f_auto/`;
      return before + transform + after;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!listingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">🏠</div>
          <p className="text-gray-600">Listing not found</p>
        </div>
      </div>
    );
  }

  // add mapsSrc for embed and maps link
  const mapsSrc = listingData?.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        listingData.address
      )}&output=embed`
    : null;

  const hasArea =
    listingData?.area !== undefined &&
    listingData?.area !== null &&
    listingData?.area !== "";

  const gridColsClass = hasArea ? "sm:grid-cols-5" : "sm:grid-cols-4";

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Gallery */}
      <div className="rounded-lg overflow-hidden shadow mb-6">
        <Swiper navigation={true}>
          {listingData.images &&
            listingData.images.map((imageUrl) => (
              <SwiperSlide key={imageUrl}>
                <div className="flex items-center justify-center rounded-sm bg-gray-50">
                  <img
                    src={transformCloudinaryUrlNoCrop(imageUrl, 900)}
                    alt="listing"
                    className="w-full max-h-[260px] sm:max-h-80 md:max-h-[380px] object-contain"
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* Details card under Swiper */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">
              {listingData.name}
            </h2>
            <div className="mt-2 flex items-center text-sm text-gray-500 gap-2">
              <FaMapMarkerAlt className="text-indigo-500" />
              <span className="truncate">{listingData.address}</span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                <span className="font-medium">
                  {listingData.type?.toUpperCase()}
                </span>
              </span>
              {listingData.offer && (
                <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                  OFFER
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-44 text-right">
            {/* Price: show crossed original when offer exists, highlight offer in red */}
            {listingData.offer && listingData.discountedPrice > 0 ? (
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-500 line-through">
                  {listingData.regularPrice}$
                  {listingData.type === "rent" && (
                    <span className="ml-1">/ month</span>
                  )}
                </div>
                <div className="text-3xl font-extrabold text-red-600">
                  {listingData.discountedPrice}$
                  {listingData.type === "rent" && (
                    <span className="text-sm text-gray-500 ml-1">/ month</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-green-600">
                {(listingData.discountedPrice > 0
                  ? listingData.discountedPrice
                  : listingData.regularPrice) ?? 0}
                $
                {listingData.type === "rent" && (
                  <span className="text-sm text-gray-500"> / month</span>
                )}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              Posted: {new Date(listingData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-200 pt-5">
          <div className={`grid grid-cols-2 ${gridColsClass} gap-4 text-sm`}>
            {/* Larger feature cards */}
            <div className="flex flex-col items-center gap-2 bg-indigo-50 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
                <FaBed />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {listingData.bedrooms}
              </div>
              <div className="text-xs text-indigo-600 uppercase tracking-wide">
                Bedrooms
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 bg-indigo-50 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
                <FaBath />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {listingData.bathrooms}
              </div>
              <div className="text-xs text-indigo-600 uppercase tracking-wide">
                Bathrooms
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 bg-indigo-50 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
                <FaCouch />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {listingData.furnished ? "Yes" : "No"}
              </div>
              <div className="text-xs text-indigo-600 uppercase tracking-wide">
                Furnished
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 bg-indigo-50 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
                <FaParking />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {listingData.parking ? "Yes" : "No"}
              </div>
              <div className="text-xs text-indigo-600 uppercase tracking-wide">
                Parking
              </div>
            </div>

            {hasArea && (
              <div className="flex flex-col items-center gap-2 bg-indigo-50 p-4 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
                  <FaRulerCombined />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">
                  {listingData.area}
                  <span className="text-sm ml-1">m²</span>
                </div>
                <div className="text-xs text-indigo-600 uppercase tracking-wide">
                  Area
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            {/* Location (Google Maps embed) */}
            {mapsSrc && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">
                  Location
                </h3>
                <div className="w-full rounded-md overflow-hidden border">
                  <iframe
                    title="listing-location"
                    src={mapsSrc}
                    className="w-full h-44 sm:h-60"
                    loading="lazy"
                  />
                </div>
                <div className="mt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      listingData.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {listingData.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-400">
            Listing ID: {listingData._id}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                // fetch owner by listing id (server route: /houseOwner/:id)
                setShowOwnerCard((s) => !s);
                if (!ownerData && id) {
                  try {
                    setOwnerLoading(true);
                    setOwnerError(null);
                    const res = await axios.get(
                      `http://localhost:4000/api/auth/houseOwner/${id}`,
                      { withCredentials: true }
                    );
                    setOwnerData(res.data?.data ?? res.data ?? null);
                  } catch (err) {
                    setOwnerError(
                      err.response?.data?.message ||
                        err.message ||
                        "Failed to load owner"
                    );
                  } finally {
                    setOwnerLoading(false);
                  }
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 text-sm"
            >
              Contact Owner
            </button>

            <button
              onClick={() =>
                navigator.clipboard?.writeText(window.location.href)
              }
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              Share
            </button>
          </div>
        </div>

        {/* Owner card modal / panel */}
        {showOwnerCard && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowOwnerCard(false)}
            />

            <div className="relative bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="text-lg font-semibold">Owner</div>
                <button
                  onClick={() => setShowOwnerCard(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close owner card"
                >
                  ✕
                </button>
              </div>

              <div className="p-4">
                {ownerLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700" />
                  </div>
                ) : ownerError ? (
                  <div className="text-red-600 text-sm">{ownerError}</div>
                ) : ownerData ? (
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        ownerData.photo ||
                        ownerData.avatar ||
                        ownerData.profilePic ||
                        "/default-avatar.png"
                      }
                      alt={ownerData.name || "Owner"}
                      className="w-16 h-16 rounded-full object-cover bg-gray-100"
                    />

                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {ownerData.name || ownerData.fullName || "Owner"}
                      </div>

                      {/* Phone */}
                      {ownerData.phone ? (
                        <div className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                          <FaPhone className="text-indigo-500" aria-hidden />
                          <a
                            href={`tel:${ownerData.phone}`}
                            className="hover:underline text-indigo-700"
                          >
                            {ownerData.phone}
                          </a>
                        </div>
                      ) : null}

                      {/* Address */}
                      {ownerData.address ? (
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <FaMapMarkerAlt
                            className="text-indigo-500"
                            aria-hidden
                          />
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              ownerData.address
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline text-indigo-600"
                          >
                            {ownerData.address}
                          </a>
                        </div>
                      ) : null}

                      {/* Email */}
                      <div className="text-sm text-gray-600 mt-2">
                        {ownerData.email ? (
                          <a
                            href={`mailto:${ownerData.email}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {ownerData.email}
                          </a>
                        ) : (
                          "No email available"
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        {ownerData.email && (
                          <a
                            href={`mailto:${ownerData.email}`}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            Send email
                          </a>
                        )}
                        {ownerData.phone && (
                          <a
                            href={`tel:${ownerData.phone}`}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Call
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setShowOwnerCard(false);
                          }}
                          className="px-3 py-1 text-sm border rounded"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    No owner information available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listing;
