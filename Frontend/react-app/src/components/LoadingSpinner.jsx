import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center w-full h-64">
      <div className="relative w-16 h-16">
        {/* حلقه بیرونی */}
        <div className="absolute w-full h-full border-4 border-primary/20 border-solid rounded-full"></div>
        {/* حلقه داخلی متحرک */}
        <div className="absolute w-full h-full border-4 border-transparent border-t-accent border-solid rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;