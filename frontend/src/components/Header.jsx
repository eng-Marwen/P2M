import { FaSearch } from "react-icons/fa"; //found awesome icons
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      <div className=" bg-slate-200 shadow-md">
        <div className="flex  items-center justify-between mx-auto h-15 max-w-6xl">
          <Link to="/">
            <h1 className="flex flex-wrap text-sm sm:text-xl font-bold ">
              <span className="text-slate-500">Samsar</span>
              <span className="text-slate-700">ProMax</span>
            </h1>
          </Link>
          <form className="bg-slate-100  rounded flex items-center">
            <input
              type="text"
              placeholder="search . . ."
              className="
            bg-transparent focus:outline-none 
            w-24 sm:w-64 h-8
            "
            />
            <FaSearch className="text-slate-600" />
          </form>
          <ul className="flex gap-4  font-medium text-slate-600 text-sm  items-center">
            <Link to="/"><li className="hidden sm:inline hover:underline">Home</li></Link>
            <Link to="/about"><li className="hidden sm:inline hover:underline  ">About</li></Link>
            <Link to="/sign-in"><li className="hover:underline">Sign In</li></Link>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;
