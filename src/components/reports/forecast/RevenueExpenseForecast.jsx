import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSalesFcast } from '../../../services/chatService';
import { FilterSection } from './FilterSection';
import { HistoricalChart } from './HistoricalChart';
import { ForecastChart } from './ForecastChart';
import { transformForecastData, transformHistoricalData } from '../../../utils/chartDataTransformers';
import { ErrorState, LoadingState } from './LoadingState';

const API_BASE_URL = 'https://agentic.aiweaver.ai/api';

const fetchDimensions = async () => {
  const userId = localStorage.getItem('user');
  const sessionIdLocal = localStorage.getItem('session_id');
  
  const url = `${API_BASE_URL}/rpt2/forecast-dimensions?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(sessionIdLocal)}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }
  
  return res.json();
};

export const RevenueExpenseForecast = ({ userName, sessionId }) => {
  const [filters, setFilters] = useState({
    fundCodes: [],
    rollupDepartments: [],
    departments: [],
    accounts: [],
    pastYears: '',
    forecastMethods: []
  });

  // Fetch dimensions using react-query with refetchOnWindowFocus
  const { data: dimensionsData, isLoading: isDimensionsLoading } = useQuery({
    queryKey: ['forecast-dimensions'],
    queryFn: fetchDimensions,
    refetchOnWindowFocus: true,
  });

  // Format dimensions
  const dimensions = useMemo(() => {
    if (!dimensionsData?.dimensions) {
      return {
        fundCodes: [],
        rollupDepartments: [],
        departments: [],
        accounts: [],
      };
    }

    const formatDimension = (dimensionArray) => {
      return dimensionArray?.map(item => [item.code, item.label || item.code]) || [];
    };

    return {
      fundCodes: formatDimension(dimensionsData.dimensions.fund_code),
      rollupDepartments: formatDimension(dimensionsData.dimensions.parent_deptid),
      departments: formatDimension(dimensionsData.dimensions.deptid),
      accounts: formatDimension(dimensionsData.dimensions.account),
    };
  }, [dimensionsData]);

  // Single API call for all data with auto-refetch on tab switch
  const { data: forecastData, isLoading, error, isFetching } = useQuery({
    queryKey: ['forecast', userName, sessionId, filters],
    queryFn: () => getSalesFcast({
      user_id: userName,
      session_id: sessionId,
      fund_code: filters.fundCodes,
      rollup_deptid: filters.rollupDepartments,
      deptid: filters.departments,
      account: filters.accounts,
      past_years: filters.pastYears,
      forecast_method: filters.forecastMethods,
      as_of_date:'',
    }),
    enabled: !!(userName && sessionId),
    refetchOnWindowFocus: true,
  });

  // Transform data for charts
  const historicalData = useMemo(() => {
    return transformHistoricalData(forecastData?.historical_actuals);
  }, [forecastData]);

  const forecastChartData = useMemo(() => {
    return transformForecastData(forecastData?.forecast);
  }, [forecastData]);

  const handleFiltersChange = (newFilters) => {
    console.log('Filter change received:', newFilters);
    setFilters(newFilters);
  };

  // Show error state
  if (error && !forecastData) {
    return <ErrorState title="Revenue & Expense Forecast" error={error} />;
  }

  return (
    <div className="space-y-8">
      {/* Historical Revenue & Expense Chart */}
      <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
        <FilterSection 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          dimensions={dimensions}
          isDimensionsLoading={isDimensionsLoading}
          showForecastMethod={false}
        />

        {isLoading && !forecastData ? (
          <div className="mt-6">
            <div className="text-2xl font-bold text-gray-900 mb-6">
              Revenue & Expense Forecast
              <span className="ml-2 text-sm text-blue-500">(Loading...)</span>
            </div>
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : historicalData.length > 0 ? (
          <HistoricalChart data={historicalData} isFetching={isFetching} />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">
              No historical data available
            </div>
          </div>
        )}
      </div>

      {/* 12-Month Forecast Chart */}
      <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
        <FilterSection 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          dimensions={dimensions}
          isDimensionsLoading={isDimensionsLoading}
          showForecastMethod={true}
        />

        {isLoading && !forecastData ? (
          <div className="mt-6">
            <div className="text-2xl font-bold text-gray-900 mb-6">
              12-Month Forecast
              <span className="ml-2 text-sm text-blue-500">(Loading...)</span>
            </div>
            <div className="animate-pulse">
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <ForecastChart data={forecastChartData} isFetching={isFetching} />
        )}
      </div>
    </div>
  );
};