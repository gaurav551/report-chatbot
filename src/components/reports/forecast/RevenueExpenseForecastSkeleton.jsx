import React from 'react';

const Skeleton = ({ width = "100%", height = "16px", className = "" }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded ${className}`}
    style={{ width, height }}
  />
);

const Circle = ({ size = "12px", className = "" }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);

export const RevenueExpenseForecastSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <Skeleton width="300px" height="32px" className="mb-2" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Circle size="12px" />
            <Skeleton width="60px" height="14px" />
          </div>
          <div className="flex items-center space-x-2">
            <Circle size="12px" />
            <Skeleton width="70px" height="14px" />
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-96 relative">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="50px" height="10px" />
          ))}
        </div>

        {/* Chart background */}
        <div className="ml-14 mr-4 h-full bg-gray-50 rounded border border-gray-100 relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={`h-${i}`}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${25 * (i + 1)}%` }}
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`v-${i}`}
                className="absolute h-full border-l border-gray-200"
                style={{ left: `${16.67 * (i + 1)}%` }}
              />
            ))}
          </div>

          {/* Chart content */}
          <div className="absolute inset-6 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
              <span className="text-sm text-gray-500">Loading chart...</span>
            </div>
          </div>
        </div>

        {/* X-axis */}
        <div className="absolute bottom-0 left-14 right-4 flex justify-between items-end pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} width="40px" height="10px" />
          ))}
        </div>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs space-y-2">
          <Skeleton width="120px" height="12px" />
          <Skeleton width="100px" height="12px" />
          <Skeleton width="200px" height="12px" />
          <Skeleton width="150px" height="12px" />
          <Skeleton width="140px" height="12px" />
        </div>
      )}
    </div>
  );
};