import React, { useState, ChangeEvent } from 'react';

const SearchBarWithSuggestions: React.FC= () => {
  return (
    <><input
          type="text"
          placeholder="Search"
          className="border border-gray-300 rounded px-4 py-2" /><button className="bg-gray-500 text-white px-3 py-2 rounded">
              🔍
          </button><button className="bg-gray-500 text-white px-3 py-2 rounded">
              ⬇️
          </button><button className="bg-gray-500 text-white px-3 py-2 rounded">
              🔔
          </button></>
  );
};

export default SearchBarWithSuggestions;
