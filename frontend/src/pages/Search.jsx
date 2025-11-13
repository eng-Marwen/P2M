import axios from "axios";
import { useEffect, useState } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import House from "../components/House.jsx";
import { showToast } from "../popups/tostHelper.js";

const COLORS = {
  pageBg: "bg-slate-50",
  container: "max-w-6xl mx-auto px-4 py-6",
  title: "text-2xl sm:text-3xl font-bold text-slate-800",
  panelBg: "bg-white",
  panelBorder: "border border-gray-100",
  panelShadow: "shadow-sm",
  panelRounded: "rounded-xl",
  input:
    "px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200",
  btnPrimary: "bg-indigo-600 text-white hover:bg-indigo-700",
  btnGhost: "bg-white border border-gray-200",
  chipActive: "bg-indigo-50 border-indigo-200",
  chipInactive: "bg-white border-gray-200",
  statText: "text-sm text-gray-500",
  resultsTitle: "text-xl font-semibold text-slate-800",
};

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
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
    } else if (e.target.id === "search") {
      setSideBar((prev) => ({
        ...prev,
        searchTerm: e.target.value,
      }));
    } else if (
      e.target.id === "offer" ||
      e.target.id === "parking" ||
      e.target.id === "furnished"
    ) {
      setSideBar((prev) => ({
        ...prev,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      }));
    } else if (e.target.id === "sort_order") {
      const val = (e.target.value || "").toString();
      let sort = "createdAt";
      let order = "desc";

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
    e?.preventDefault();
    showToast("Searching...", "info");

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
    setShowFilters(false);
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
        const data = response?.data;
        if (!data) {
          setHouses([]);
          showToast("No results found", "info");
        } else {
          const housesArray = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : [];
          setHouses(housesArray);
          if (housesArray.length === 0) {
            showToast("No results found", "error");
          } else {
            showToast(`${housesArray.length} result(s) found`, "success");
          }
        }
      } catch (err) {
        console.error(
          "Error fetching houses:",
          err?.response?.data || err.message
        );
        setHouses([]);
        showToast("Error fetching results", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, [location.search]);

  return (
    <div className={`${COLORS.pageBg} min-h-screen`}>
      <div className={COLORS.container}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className={COLORS.title}>Find your next home</h1>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${COLORS.panelBg} ${COLORS.panelShadow}`}
              aria-expanded={showFilters}
            >
              <FaFilter className="w-4 h-4 text-indigo-700" />
              <span className="hidden sm:inline text-sm">Filters</span>
            </button>

            <form
              onSubmit={handleSubmit}
              className="flex items-center ml-2 w-full md:w-auto"
            >
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative w-full md:w-auto">
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, address..."
                  className={`${COLORS.input} w-full md:w-80`}
                  value={sideBar.searchTerm}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters / Sidebar */}
          <aside
            className={`md:col-span-1 transition-all duration-200 ${
              showFilters ? "block" : "hidden"
            } md:block`}
          >
            <div
              className={`${COLORS.panelBg} ${COLORS.panelRounded} ${COLORS.panelBorder} p-4 ${COLORS.panelShadow} sticky top-6 bg-linear-to-b from-white to-gray-200`}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <label
                      className={`px-3 py-1 rounded-lg border ${
                        sideBar.type === "all"
                          ? COLORS.chipActive
                          : COLORS.chipInactive
                      }`}
                    >
                      <input
                        type="checkbox"
                        id="all"
                        checked={sideBar.type === "all"}
                        onChange={handleChange}
                        className=" mr-2"
                      />
                      All
                    </label>
                    <label
                      className={`px-3 py-1 rounded-lg border ${
                        sideBar.type === "rent"
                          ? COLORS.chipActive
                          : COLORS.chipInactive
                      }`}
                    >
                      <input
                        type="checkbox"
                        id="rent"
                        className="mr-2"
                        checked={sideBar.type === "rent"}
                        onChange={handleChange}
                      />
                      Rent
                    </label>
                    <label
                      className={`px-3 py-1 rounded-lg border ${
                        sideBar.type === "sale"
                          ? COLORS.chipActive
                          : COLORS.chipInactive
                      }`}
                    >
                      <input
                        type="checkbox"
                        id="sale"
                        className="mr-2"
                        checked={sideBar.type === "sale"}
                        onChange={handleChange}
                      />
                      Sale
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Amenities
                  </label>
                  <div className="mt-2 flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="parking"
                        className="w-4 h-4"
                        checked={sideBar.parking}
                        onChange={handleChange}
                      />
                      <span className="text-sm">Parking</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="furnished"
                        className="w-4 h-4"
                        checked={sideBar.furnished}
                        onChange={handleChange}
                      />
                      <span className="text-sm">Furnished</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="offer"
                        className="w-4 h-4"
                        checked={sideBar.offer}
                        onChange={handleChange}
                      />
                      <span className="text-sm">Has Offer</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Sort
                  </label>
                  <select
                    id="sort_order"
                    defaultValue={"created_at_desc"}
                    onChange={handleChange}
                    className="mt-2 w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="price_desc">Price high to low</option>
                    <option value="price_asc">Price low to high</option>
                    <option value="created_at_desc">Latest</option>
                    <option value="created_at_asc">Oldest</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`flex-1 ${COLORS.btnPrimary} py-2 rounded-lg`}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className={`flex-1 ${COLORS.btnGhost} py-2 rounded-lg`}
                    onClick={() => {
                      setSideBar({
                        searchTerm: "",
                        type: "all",
                        offer: false,
                        parking: false,
                        furnished: false,
                        sortOrder: "createdAt",
                        order: "desc",
                      });
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </aside>

          {/* Results */}
          <section className="md:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className={COLORS.statText}>
                  {loading
                    ? "Searching..."
                    : `${houses.length} result${
                        houses.length !== 1 ? "s" : ""
                      }`}
                </div>
                <h2 className={COLORS.resultsTitle}>Search Results</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading && houses.length === 0 && (
                <div className="col-span-full text-center py-16 text-lg text-gray-500">
                  No results found
                </div>
              )}

              {loading && (
                <div className="col-span-full text-center py-16 text-lg text-gray-500">
                  Loading...
                </div>
              )}

              {!loading &&
                houses.length > 0 &&
                houses.map((house) => <House key={house._id} house={house} />)}
            </div>
          </section>
        </div>
      </div>
      {/* TODO: add show more less */}

      <ToastContainer />
    </div>
  );
};

export default Search;
