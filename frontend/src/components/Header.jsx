import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa"; //found awesome icons
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.user.currentUser);
  //console.log("Current User:", currentUser);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("search", searchQuery);
    const searchUrl = urlSearchParams.toString();
    navigate(`/search?${searchUrl}`);
  };

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(location.search);
    const searchParam = urlSearchParams.get("search") || "";
    setSearchQuery(searchParam);
  }, [location.search]);
  return (
    <>
      <div className=" bg-slate-200 shadow-md">
        <div className="flex  items-center justify-between mx-auto h-15 max-w-6xl">
          <Link to="/">
            <h1 className="flex flex-wrap text-xl sm:text-xl font-bold ">
              <span className="text-slate-500">Samsar</span>
              <span className="text-slate-700">ProMax</span>
            </h1>
          </Link>
          <form
            onSubmit={handleSearchSubmit}
            className="bg-slate-100  rounded flex items-center"
          >
            <input
              type="text"
              placeholder="search . . ."
              className="bg-transparent focus:outline-none w-24 sm:w-64 p-1.5"
              onChange={handleSearchChange}
              value={searchQuery}
            />
            <button type="submit">
              <FaSearch className="text-slate-600 mr-2" />
            </button>
          </form>
          <ul className="flex gap-4  font-medium text-slate-600 text-lg  items-center">
            <Link to="/">
              <li className="hidden sm:inline hover:underline">Home</li>
            </Link>
            <Link to="/about">
              <li className="hidden sm:inline hover:underline  ">About</li>
            </Link>

            <Link to="/profile">
              {currentUser ? (
                <img
                  src={currentUser.avatar}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer"
                />
              ) : (
                <li className="hover:underline">Sign In</li>
              )}
            </Link>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;
