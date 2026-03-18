import React from "react";

export default function SearchBar({ onSearch }) {
  return (
    <input
      type="text"
      placeholder="Search..."
      className="px-4 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
