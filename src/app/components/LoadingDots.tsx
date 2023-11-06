import React from 'react';

function LoadingDots() {
  return (
    <div className="flex items-center justify-center" style={{ minWidth: '4em', minHeight: '1.5em' }}>
      <div className="animate-pulse bg-gray-900 rounded-full w-2 h-2 mr-2"></div>
      <div className="animate-pulse bg-gray-900 rounded-full w-2 h-2 mr-2 delay-50"></div>
      <div className="animate-pulse bg-gray-900 rounded-full w-2 h-2 delay-100"></div>
    </div>
  );
}

export default LoadingDots;
