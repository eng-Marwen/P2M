import axios from "axios";
import { useEffect, useState } from "react";
import { FaTag } from "react-icons/fa";

import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

// (no SwiperCore.use here) — we'll pass modules directly to the Swiper component
const placeholder =
  "https://images.unsplash.com/photo-1505691723518-36a1fb0a5c5a?w=1200&q=60&auto=format&fit=crop";

const Card = ({ listing }) => {
  const img = listing?.images?.[0] || placeholder;
  const discountPercent =
    listing?.discountedPrice > 0 && listing?.regularPrice
      ? Math.round(
          ((listing.regularPrice - listing.discountedPrice) /
            listing.regularPrice) *
            100
        )
      : null;
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative w-full h-44 bg-gray-100">
        {/* Offer badge */}
        {listing?.offer && (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-semibold shadow">
            <FaTag className="w-3 h-3" />
            <span>
              {discountPercent ? `${discountPercent}% OFF` : "Special Offer"}
            </span>
          </span>
        )}
        <img
          src={img}
          alt={listing.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 truncate">
              {listing.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1 truncate">
              {listing.location || listing.address || listing.type}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-indigo-600">
              $
              {listing.discountedPrice > 0
                ? listing.discountedPrice
                : listing.regularPrice}
            </div>
            <div className="text-xs text-slate-400 mt-1">{listing.type}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Link
            to={`/listing/${listing._id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            View listing
          </Link>
          <span className="text-xs text-slate-400">
            {listing.rooms ? `${listing.rooms} rooms` : ""}
          </span>
        </div>
      </div>
    </article>
  );
};

const SectionHeader = ({ title, to }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
    {to && (
      <Link to={to} className="text-sm text-indigo-600 hover:underline">
        See all
      </Link>
    )}
  </div>
);

const Home = () => {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    const fetch = async (url, setter) => {
      try {
        const { data } = await axios.get(url);
        setter(data?.data || []);
        console.log("Fetched data from", url, data);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };

    fetch("http://localhost:4000/api/houses/?offer=true", setOfferListings);
    fetch("http://localhost:4000/api/houses/?type=sale", setSaleListings);
    fetch("http://localhost:4000/api/houses/?type=rent", setRentListings);
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              Find your next <span className="text-indigo-600">perfect</span>{" "}
              home with ease
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              Samsar ProMax helps you discover handpicked listings, save
              favorites and contact owners — quickly and securely.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-black text-white font-semibold shadow hover:opacity-95"
              >
                Get started
              </Link>

              <Link
                to="/create-house"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-slate-700 hover:bg-gray-50"
              >
                List a property
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-indigo-600">1k+</div>
                <div className="text-xs text-slate-500">Listings</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-indigo-600">24/7</div>
                <div className="text-xs text-slate-500">Support</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  Trusted
                </div>
                <div className="text-xs text-slate-500">Agents</div>
              </div>
            </div>
          </div>

          <div className="order-first lg:order-last">
            <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-white">
              <div className="relative w-full h-64 sm:h-80 bg-gray-100">
                {offerListings?.[0]?.offer && (
                  <span className="absolute top-4 left-4 z-30 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-sm font-semibold shadow">
                    <FaTag className="w-4 h-4" />
                    {offerListings?.[0]?.discountedPrice > 0 &&
                    offerListings?.[0]?.regularPrice
                      ? `${Math.round(
                          ((offerListings[0].regularPrice -
                            offerListings[0].discountedPrice) /
                            offerListings[0].regularPrice) *
                            100
                        )}% OFF`
                      : "Special Offer"}
                  </span>
                )}
                <img
                  src={offerListings?.[0]?.images?.[0] || placeholder}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="font-semibold text-slate-800">
                  Featured: {offerListings?.[0]?.name || "Sea view apartment"}
                </div>
                <div className="text-sm text-slate-500">
                  {offerListings?.[0]?.description ||
                    "A beautiful apartment near the beach."}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offers slider */}
        {offerListings && offerListings.length > 0 && (
          <section className="mb-10">
            <SectionHeader title="Special offers" to="/search?offer=true" />
            <Swiper
              slidesPerView={1}
              spaceBetween={12}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
            >
              {offerListings.map((listing) => (
                <SwiperSlide key={listing._id}>
                  <Card listing={listing} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* Sale listings (grid, first 6) */}
        {saleListings && saleListings.length > 0 && (
          <section className="mb-10">
            <SectionHeader title="Homes for sale" to="/search?type=sale" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saleListings.slice(0, 6).map((l) => (
                <Card key={l._id} listing={l} />
              ))}
            </div>
          </section>
        )}

        {/* Rent listings (grid, first 6) */}
        {rentListings && rentListings.length > 0 && (
          <section className="mb-12">
            <SectionHeader title="Rentals" to="/search?type=rent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentListings.slice(0, 6).map((l) => (
                <Card key={l._id} listing={l} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mb-12">
          <div className="rounded-xl bg-linear-to-r from-slate-900 to-black text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">
                Ready to find your new home?
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Search thousands of listings in seconds.
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:opacity-95"
            >
              Start searching
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
