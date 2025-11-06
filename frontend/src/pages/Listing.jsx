import axios from "axios";
import { useEffect, useState } from "react";
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

  return (
    <div className="">
      <Swiper navigation={true}>
        {listingData.images &&
          listingData.images.map((imageUrl) => (
            <SwiperSlide key={imageUrl}>
              <div
                className=" h-[550px]"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }}
              >{imageUrl}</div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default Listing;
