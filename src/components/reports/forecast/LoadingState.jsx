import React from 'react';
import { RevenueExpenseForecastSkeleton } from './RevenueExpenseForecastSkeleton';

export const LoadingState = ({ title = "Loading..." }) => (
  <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
    <RevenueExpenseForecastSkeleton />
  </div>
);

// components/ErrorState.js

export const ErrorState = ({ title, error }) => (
  <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-red-500 mb-2">Failed to load forecast data</div>
        <div className="text-sm text-gray-500">{error?.message}</div>
      </div>
    </div>
  </div>
);