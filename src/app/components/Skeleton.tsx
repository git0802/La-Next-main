// components/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  height?: string; // Height in Tailwind CSS class format, e.g., 'h-4'
  lines?: number; // Number of skeleton lines
}

const Skeleton: React.FC<SkeletonProps> = ({ height = 'h-3', lines = 1 }) => {
  const skeletons = Array.from({ length: lines }, (_, index) => index);

  return (
    <div>
      {skeletons.map((_, index) => (
        <div key={index} className={`animate-pulse bg-gray-300 mb-6 mt-3 rounded ${height} my-1`}></div>
      ))}
    </div>
  );
};

export default Skeleton;
