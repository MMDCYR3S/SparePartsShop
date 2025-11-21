// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
// i want to timer 2000 ms to i can see  the loading spinner
setTimeout(() => {
  window.location.reload();
}, 2000);


  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-yellow-400 border-solid rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;