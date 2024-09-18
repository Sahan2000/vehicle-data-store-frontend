import React, { useState, ChangeEvent } from 'react';

const FileUpload: React.FC = () => {

  return (
    <>
      <input
        type="file"
        className="border border-gray-300 rounded px-4 py-2" />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload
      </button>
    </>
  );
};

export default FileUpload;
