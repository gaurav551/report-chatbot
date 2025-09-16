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

export const AnalyticsSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
     

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Circle size="20px" />
                <Skeleton width="60px" height="20px" className="rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton width="80%" height="14px" />
                <Skeleton width="120px" height="24px" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Navigation */}
        <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2 px-2 sm:px-4 py-2 bg-gray-100 rounded-lg border-2 border-transparent">
              <Circle size="16px" />
              <Skeleton width="120px" height="16px" />
            </div>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
          <div className="mb-4">
            <Skeleton width="300px" height="24px" />
          </div>
          
          {/* Chart Container */}
          <div className="h-64 sm:h-80 bg-white rounded border border-gray-100 relative">
            {/* Y-axis */}
            <div className="absolute left-2 top-4 h-5/6 flex flex-col justify-between">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} width="40px" height="10px" />
              ))}
            </div>

            {/* Chart content */}
            <div className="ml-12 mr-4 mt-4 mb-12 h-5/6 flex items-end justify-around space-x-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 flex space-x-1 items-end">
                  <div className="bg-blue-200 animate-pulse rounded-t" style={{ height: `${Math.random() * 80 + 20}%`, width: '48%' }} />
                  <div className="bg-green-200 animate-pulse rounded-t" style={{ height: `${Math.random() * 60 + 30}%`, width: '48%' }} />
                </div>
              ))}
            </div>

            {/* X-axis */}
            <div className="absolute bottom-2 left-12 right-4 flex justify-around">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} width="60px" height="10px" />
              ))}
            </div>

            {/* Loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500" />
                <span className="text-sm text-gray-600">Loading chart...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast Section */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <Skeleton width="280px" height="32px" />
            <div className="flex space-x-4">
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
          
          <div className="h-96 bg-gray-50 rounded border border-gray-100 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500" />
              <span className="text-sm text-gray-500">Loading forecast...</span>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <Skeleton width="180px" height="20px" />
          </div>
          <div className="divide-y divide-gray-200">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3">
              <div className="flex justify-between">
                <Skeleton width="80px" height="12px" />
                <div className="flex space-x-8">
                  <Skeleton width="60px" height="12px" />
                  <Skeleton width="50px" height="12px" />
                  <Skeleton width="70px" height="12px" />
                </div>
              </div>
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="px-6 py-4 bg-white hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <Skeleton width="80px" height="16px" />
                  <div className="flex space-x-8">
                    <Skeleton width="80px" height="16px" />
                    <Skeleton width="80px" height="16px" />
                    <Skeleton width="80px" height="16px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};