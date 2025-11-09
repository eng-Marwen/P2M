const Search = () => {
  return (
    <div className="flex gap-4 flex-col md:flex-row max-w-6xl mx-auto ">
      <div className=" p-7 border-b border-gray-300 sm:border-r md:min-h-screen">
        <form className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="font-semibold whitespace-nowrap">
              Search Term
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search..."
              className="border border-gray-500 bg-white rounded-lg p-3 w-full"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="font-semibold">Type:</label>
            <div className="flex items-center gap-2 ">
              <input type="checkbox" id="all" className="w-5" />
              <span>Rent & Sale</span>
            </div>

            <div className="flex items-center gap-2 ">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent </span>
            </div>

            <div className="flex items-center gap-2 ">
              <input type="checkbox" id="sale" className="w-5" />
              <span> Sale</span>
            </div>

            <div className="flex items-center gap-2 ">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="font-semibold">Amenities:</label>
            <div className="flex items-center gap-2 ">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking</span>
            </div>

            <div className="flex items-center gap-2 ">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort By:</label>
            <select
              id="sort_order"
              className="border border-gray-500 bg-white rounded-lg p-3"
            >
              <option >Price high to low</option>
              <option >Price low to high</option>
              <option >Latest</option>
              <option >Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700   uppercase text-white rounded-lg p-3 hover:bg-slate-600 transition-colors">
            Search
          </button>
        </form>
      </div>
      <div>
        <h1 className="text-2xl font-semibold border-b p-3 border-slate-300 text-slate-600 mt-5">Search Results</h1>
      </div>
    </div>
  );
};

export default Search;
