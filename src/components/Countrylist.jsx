"use client";
import React, { useEffect, useState } from "react";
import { fetchCountries } from "../service/ApiService";
import Modal from "react-modal";

const CountryList = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const rowsPerPage = 25;

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
        setFilteredCountries(data);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    loadCountries();
  }, []);

  // Handle search
  useEffect(() => {
    const results = countries.filter((country) =>
      country.name.official.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(results);
  }, [searchTerm, countries]);

  // Handle sorting
  const handleSort = () => {
    const sortedCountries = [...filteredCountries].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.official.localeCompare(b.name.official);
      } else {
        return b.name.official.localeCompare(a.name.official);
      }
    });
    setFilteredCountries(sortedCountries);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastCountry = currentPage * rowsPerPage;
  const indexOfFirstCountry = indexOfLastCountry - rowsPerPage;
  const currentCountries = filteredCountries.slice(
    indexOfFirstCountry,
    indexOfLastCountry
  );

  // Modal handling
  const openModal = (country) => {
    setSelectedCountry(country);
  };

  const closeModal = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-3xl text-center mb-8">
        <a
          href="/"
          className="text-3xl sm:text-4xl font-extrabold text-blue-900"
        >
          Country Catalog
        </a>
      </div>

      <div className="w-full max-w-3xl mb-6">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by country name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
        />
      </div>

      <div className="w-full max-w-3xl mb-6 text-center">
        {/* Sort Button */}
        <button
          onClick={handleSort}
          className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-700 text-white rounded-lg shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          Sort by Name ({sortOrder === "asc" ? "Ascending" : "Descending"})
        </button>
      </div>

      <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg overflow-x-auto">
        {/* Country Table */}
        <table className="w-full bg-white">
          <thead className="bg-blue-300 border-b border-gray-200">
            <tr>
              <th className="p-3 sm:p-4 text-left text-black">Flag</th>
              <th className="p-3 sm:p-4 text-left text-black">Country Name</th>
              <th className="p-2 sm:p-3 text-left text-black">2 Char Code</th>
              <th className="p-2 sm:p-3 text-left text-black">3 Char Code</th>
              <th className="p-3 sm:p-4 text-left text-black">Native Name</th>
              <th className="p-3 sm:p-4 text-left text-black">
                Alternative Names
              </th>
              <th className="p-3 sm:p-4 text-left text-black">Calling Codes</th>
            </tr>
          </thead>
          <tbody>
            {currentCountries.map((country) => (
              <tr
                key={country.cca3}
                onClick={() => openModal(country)}
                className="cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <td className="p-2 sm:p-3">
                  <img
                    src={country.flags.png}
                    alt={country.name.official}
                    className="w-12 h-auto sm:w-16 rounded-md"
                  />
                </td>
                <td className="p-2 sm:p-3 text-gray-700">
                  {country.name.official}
                </td>
                <td className="p-2 sm:p-3 text-gray-700">{country.cca2}</td>
                <td className="p-2 sm:p-3 text-gray-700">{country.cca3}</td>
                <td className="p-2 sm:p-3 text-gray-700">
                  {country.name.nativeName
                    ? Object.values(country.name.nativeName)
                        .map((native) => native.common)
                        .join(", ")
                    : "N/A"}
                </td>
                <td className="p-2 sm:p-3 text-gray-700">
                  {country.altSpellings.join(", ")}
                </td>
                <td className="p-2 sm:p-3 text-gray-700">
                  {country.idd.root + (country.idd.suffixes || []).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full max-w-3xl mt-6 text-center">
        {/* Pagination Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from(
            { length: Math.ceil(filteredCountries.length / rowsPerPage) },
            (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg focus:outline-none transition-colors ${
                  currentPage === index + 1
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>

      {/* Modal for Detailed Information */}
      {selectedCountry && (
        <Modal
          isOpen={!!selectedCountry}
          onRequestClose={closeModal}
          className="fixed inset-0 flex justify-center items-center p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75"
        >
          <div className="flex flex-col items-center w-full p-4 sm:p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-blue-900">
              {selectedCountry.name.official}
            </h2>
            <div className="mb-4 flex flex-col items-center">
              <img
                src={selectedCountry.flags.png}
                alt={selectedCountry.name.official}
                className="w-32 h-auto sm:w-48 rounded-md mb-4"
              />
              <p className="mb-2 text-gray-700">
                <strong>Region:</strong> {selectedCountry.region}
              </p>
              <p className="mb-2 text-gray-700">
                <strong>Subregion:</strong> {selectedCountry.subregion}
              </p>
              <p className="mb-2 text-gray-700">
                <strong>Population:</strong> {selectedCountry.population}
              </p>
              <p className="mb-2 text-gray-700">
                <strong>Capital:</strong> {selectedCountry.capital}
              </p>
              <p className="mb-4 text-gray-700">
                <strong>Area:</strong> {selectedCountry.area} km²
              </p>
              <p className="mb-2 text-gray-700">
                <strong>Languages:</strong>{" "}
                {Object.values(selectedCountry.languages || {}).join(", ")}
              </p>
              <p className="mb-2 text-gray-700">
                <strong>Currencies:</strong>{" "}
                {Object.values(selectedCountry.currencies || {})
                  .map((currency) => `${currency.name} (${currency.symbol})`)
                  .join(", ")}
              </p>
              <p className="mb-2 text-gray-700">
                <strong>Timezone:</strong>{" "}
                {selectedCountry.timezones.join(", ")}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CountryList;
