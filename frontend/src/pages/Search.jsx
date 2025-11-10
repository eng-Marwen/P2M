import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState([]);
  const [sideBar, setSideBar] = useState({
    searchTerm: "",
    type: "all",
    offer: false,
    parking: false,
    furnished: false,
    sortOrder: "createdAt",
    order: "desc",
  });
  const handleChange = (e) => {
    if (
      e.target.id === "all" ||
      e.target.id === "rent" ||
      e.target.id === "sale"
    ) {
      setSideBar((prev) => ({
        ...prev,
        type: e.target.id,
      }));
    }
    if (e.target.id === "search") {
      setSideBar((prev) => ({
        ...prev,
        searchTerm: e.target.value,
      }));
    }
    if (
      e.target.id === "offer" ||
      e.target.id === "parking" ||
      e.target.id === "furnished"
    ) {
      setSideBar((prev) => ({
        ...prev,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      }));
    }
    if (e.target.id === "sort_order") {
      const val = (e.target.value || "").toString();
      let sort = "createdAt";
      let order = "desc";

      // Support multiple formats: snake_case (price_asc), dash (price-asc), camelCase (priceAsc)
      if (val.includes("_")) {
        const parts = val.split("_");
        order = parts.pop().toLowerCase();
        sort = parts.join("_");
      } else if (val.includes("-")) {
        const parts = val.split("-");
        order = parts.pop().toLowerCase();
        sort = parts.join("-");
      } else {
        const parts = val.split(/(?=[A-Z])/);
        if (parts.length > 1) {
          order = parts.pop().toLowerCase();
          sort = parts.join("");
        } else {
          sort = val || sort;
        }
      }

      // normalize known fields to match backend names
      if (sort.includes("created")) sort = "createdAt";
      if (sort.includes("price")) sort = "price";

      setSideBar((prev) => ({
        ...prev,
        sortOrder: sort,
        order: order || "desc",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (sideBar.searchTerm) queryParams.append("search", sideBar.searchTerm);
    if (sideBar.type && sideBar.type !== "all")
      queryParams.append("type", sideBar.type);
    if (sideBar.offer) queryParams.append("offer", sideBar.offer);
    if (sideBar.parking) queryParams.append("parking", sideBar.parking);
    if (sideBar.furnished) queryParams.append("furnished", sideBar.furnished);
    if (sideBar.sortOrder) queryParams.append("sort", sideBar.sortOrder);
    if (sideBar.order) queryParams.append("order", sideBar.order);
    const queryString = queryParams.toString();
    navigate(`/search?${queryString}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search") || "";
    const type = urlParams.get("type") || "all";

    const parseBool = (v) => v === "true" || v === "1";
    const offer = parseBool(urlParams.get("offer"));
    const parking = parseBool(urlParams.get("parking"));
    const furnished = parseBool(urlParams.get("furnished"));

    const sortOrder = urlParams.get("sort") || "createdAt";
    const order = urlParams.get("order") || "desc";

    if (urlParams.toString().length > 0) {
      setSideBar((prev) => ({
        ...prev,
        searchTerm,
        type,
        offer,
        parking,
        furnished,
        sortOrder,
        order,
      }));
    }

    const fetchHouses = async () => {
      setLoading(true);
      try {
        const searchQuery = urlParams.toString();
        const url = `http://localhost:4000/api/houses${
          searchQuery ? `?${searchQuery}` : ""
        }`;
        const response = await axios.get(url);
        console.log("Raw response:", response);
        const data = response?.data;
        if (!data) {
          setHouses([]);
        } else {
          // try both possible shapes (data.data or data)
          const housesArray = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : [];
          setHouses(housesArray);
        }
      } catch (err) {
        console.error(
          "Error fetching houses:",
          err?.response?.status,
          err?.response?.data || err.message
        );
        setHouses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, [location.search]);
  console.log("Houses State:", houses);
  if(loading){
    return <div className="text-center mt-10 text-2xl font-medium">Loading...</div>
  }
  return (
    <div className="flex gap-4 flex-col md:flex-row max-w-6xl mx-auto ">
      <div className=" p-7 border-b border-gray-300 sm:border-r md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <label className="font-semibold whitespace-nowrap">
              Search Term
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search..."
              className="border border-gray-500 bg-white rounded-lg p-3 w-full"
              value={sideBar.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="font-semibold">Type:</label>
            <div className="flex items-center gap-2 ">
              <input
                type="checkbox"
                id="all"
                className="w-5"
                checked={sideBar.type === "all"}
                onChange={handleChange}
              />
              <span>Rent & Sale</span>
            </div>

            <div className="flex items-center gap-2 ">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                checked={sideBar.type === "rent"}
                onChange={handleChange}
              />
              <span>Rent </span>
            </div>

            <div className="flex items-center gap-2 ">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                checked={sideBar.type === "sale"}
                onChange={handleChange}
              />
              <span> Sale</span>
            </div>

            <div className="flex items-center gap-2 ">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                checked={sideBar.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="font-semibold">Amenities:</label>
            <div className="flex items-center gap-2 ">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                checked={sideBar.parking}
                onChange={handleChange}
              />
              <span>Parking</span>
            </div>

            <div className="flex items-center gap-2 ">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                checked={sideBar.furnished}
                onChange={handleChange}
              />
              <span>Furnished</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort By:</label>
            <select
              id="sort_order"
              className="border border-gray-500 bg-white rounded-lg p-3"
              defaultValue={"created_at_desc"}
              onChange={handleChange}
            >
              <option value="price_asc">Price high to low</option>
              <option value="price_desc">Price low to high</option>
              <option value="created_at_desc">Latest</option>
              <option value="created_at_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700   uppercase text-white rounded-lg p-3 hover:bg-slate-600 transition-colors">
            Search
          </button>
        </form>
      </div>
      <div>
        <h1 className="text-2xl font-semibold border-b p-3 border-slate-300 text-slate-600 mt-5">
          Search Results
        </h1>
      </div>
    </div>
  );
};

export default Search;
