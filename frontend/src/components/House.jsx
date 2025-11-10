import { FaBath, FaBed, FaParking, FaRulerCombined, FaTag } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { Link } from "react-router-dom";

const House = ({ house }) => {
  if (!house) return null;

  const image =
    (house.imageUrls && house.imageUrls[0]) ||
    (house.images && house.images[0]) ||
    "https://via.placeholder.com/800x600?text=No+image";

  const regularVal =
    typeof house.regularPrice === "number"
      ? house.regularPrice
      : Number(house.regularPrice) || 0;
  const discountedVal =
    typeof house.discountedPrice === "number"
      ? house.discountedPrice
      : house.discountPrice && Number(house.discountPrice)
      ? Number(house.discountPrice)
      : 0;

  const hasOffer = Boolean(house.offer) && discountedVal > 0;

  const formatCurrency = (v) =>
    Number(v).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const address =
    house.address ||
    (house.name && house.name.split("-").join(" ")) ||
    "Unknown";

  const beds = typeof house.bedrooms === "number" ? house.bedrooms : "-";
  const baths = typeof house.bathrooms === "number" ? house.bathrooms : "-";
  const area = house.area || house.size || "—";
  const isRent = house.type === "rent";
  const hasParking = Boolean(house.parking);

  return (
    <article className="group max-w-xs bg-white rounded-3xl shadow-[0_8px_30px_rgba(2,6,23,0.08)] overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={image}
          alt={house.name || "listing image"}
          className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* ribbon offer */}
        {hasOffer && (
          <div className="absolute left-3 top-3 -rotate-6 bg-linear-to-r from-red-500 to-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            <FaTag className="inline-block mr-1 w-3 h-3 align-text-bottom" />
            Offer
          </div>
        )}

        {/* price pill */}
        <div className="absolute right-3 bottom-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-sm text-right">
          <div className="text-base font-extrabold leading-tight text-gray-900">
            {hasOffer
              ? formatCurrency(discountedVal)
              : formatCurrency(regularVal)}
          </div>
          {isRent && <div className="text-[11px] text-gray-500">/ month</div>}
          {hasOffer && (
            <div className="text-[11px] text-gray-400 line-through mt-0.5">
              {formatCurrency(regularVal)}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
              {house.name || "Untitled listing"}
            </h3>

            <div className="mt-1 flex items-center text-xs text-gray-500 gap-2">
              <MdLocationOn className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>

          <div className="text-right text-xs text-gray-400">
            <div>
              {new Date(house.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-xs text-gray-700 shadow-sm">
            <FaBed className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium">{beds}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-xs text-gray-700 shadow-sm">
            <FaBath className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium">{baths}</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs shadow-sm ${
              hasParking ? "bg-green-50 text-green-800" : "bg-gray-50 text-gray-700"
            }`}
          >
            <FaParking className="w-3.5 h-3.5" />
            <span className="font-medium">{hasParking ? "Parking" : "No Parking"}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-xs text-gray-700 shadow-sm">
            <FaRulerCombined className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium">{area}{area !== "—" && " m²"}</span>
          </div>
        </div>

        {/* footer */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            to={`/listing/${house._id}`}
            className="flex-1 inline-flex items-center justify-center bg-black text-white py-2 rounded-xl text-sm font-medium shadow hover:bg-neutral-900 transition-colors"
          >
            Show Details
          </Link>

          <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
            <span className="text-xs text-gray-500">Share</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default House;
