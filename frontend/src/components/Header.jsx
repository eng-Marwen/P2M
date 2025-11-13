import { useEffect, useRef, useState } from "react";
import { FaBars, FaSearch, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(location.search);
    const searchParam = urlSearchParams.get("search") || "";
    setSearchQuery(searchParam);
  }, [location.search]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("search", searchQuery);
    const searchUrl = urlSearchParams.toString();
    navigate(`/search?${searchUrl}`);
    setMobileOpen(false);
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="https://github.com/eng-Marwen/images/blob/main/logoSamsar.png?raw=true"
              className="w-15  rounded-lg"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xl font-semibold text-shadow-black">
                Samsar
              </span>
              <span className="text-lg font-medium text-slate-500 -mt-0.5">
                ProMax
              </span>
            </div>
            <div className="sm:hidden text-sm font-semibold text-slate-700">
              Samsar ProMax
            </div>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 mx-4 max-w-xl"
            role="search"
          >
            <div className="relative">
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search listings, city, address..."
                className="w-full hidden sm:inline-block px-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-100 transition"
                aria-label="Search"
              />
              {/* mobile compact */}
              <div className="sm:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen((s) => !s);
                    setTimeout(() => inputRef.current?.focus(), 120);
                  }}
                  aria-label="Open search"
                  className="p-2 rounded-md text-slate-700 hover:bg-gray-100"
                >
                  <FaSearch />
                </button>

                <div className="flex items-center gap-2 ml-auto ">
                  {currentUser ? (
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="w-9 h-9 rounded-full overflow-hidden border border-gray-200"
                      aria-label="Profile"
                    >
                      <img
                        src={currentUser.avatar || "/placeholder-profile.png"}
                        alt={currentUser.username || "profile"}
                        className="w-full h-full object-cover "
                      />
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setMobileOpen((s) => !s)}
                    aria-label="Open menu"
                    className="p-2 rounded-md text-slate-700 hover:bg-gray-100"
                  >
                    {mobileOpen ? <FaTimes /> : <FaBars />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-gray-400 hover:bg-gray-600 text-white text-sm rounded-full"
                aria-label="Search"
              >
                <FaSearch />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-black  hover:text-slate-800 hover:font-semibold hover:underline"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-sm text-black  hover:text-slate-800 hover:font-semibold hover:underline"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-sm text-black hover:text-slate-800 hover:font-semibold hover:underline"
            >
              Contact
            </Link>

            <Link
              to="/create-house"
              className="px-3 py-1.5 rounded-md text-sm bg-green-50 text-shadow-black-600 border border-black "
            >
              Create Listing
            </Link>

            <Link
              to={currentUser ? "/profile" : "/sign-in"}
              className="flex items-center gap-3"
            >
              {currentUser ? (
                <img
                  src={currentUser.avatar || "/placeholder-profile.png"}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                />
              ) : (
                <button className="text-sm px-3 py-1.5 rounded-md border border-black hover:bg-gray-100">
                  Sign In
                </button>
              )}
            </Link>
          </nav>

          {/* mobile controls are rendered inside the search form on small screens (avoid duplication) */}
        </div>

        {/* Mobile Panel */}
        <div
          className={`sm:hidden mt-3 transition-max-h duration-300 overflow-hidden ${
            mobileOpen ? "max-h-[500px]" : "max-h-0"
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="mb-3 px-2">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search listings, city, address..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none"
                aria-label="Mobile search"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-gray-400 hover:bg-gray-600 text-white"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-2 px-2 pb-4">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md text-sm text-black hover:text-slate-800 hover:font-semibold hover:underline"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md text-sm text-black hover:text-slate-800 hover:font-semibold hover:underline"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md text-sm text-black hover:text-slate-800 hover:font-semibold hover:underline"
            >
              Contact
            </Link>
            <Link
              to="/create-house"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md text-sm bg-green-50 text-black border border-black hover:bg-green-100 hover:font-semibold"
            >
              Create Listing
            </Link>
            <Link
              to={currentUser ? "/profile" : "/sign-in"}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md text-sm"
            >
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar || "/placeholder-profile.png"}
                    alt={currentUser.username || "profile"}
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
                  />
                  <span className="text-black hover:text-slate-800 hover:font-semibold hover:underline">
                    My Profile
                  </span>
                </div>
              ) : (
                <button className="w-full text-sm px-3 py-1.5 rounded-md border border-black text-black hover:bg-gray-100 hover:font-semibold">
                  Sign In
                </button>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
