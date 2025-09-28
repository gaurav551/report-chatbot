import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine 
} from 'recharts';
import { RevenueExpenseForecastSkeleton } from './RevenueExpenseForecastSkeleton';
import { RevenueExpenseForecastFilter } from './RevenueExpenseForecastFilter';
import { TwelveMonthForecast } from './TwelveMonthForecast';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getSalesFcast } from '../../../services/chatService';
import { CustomForecastTooltip } from './CustomForecastTooltip';

export const RevenueExpenseForecast = ({ userName, sessionId }) => {
 const [filters, setFilters] = useState({
  fundCodes: [],
  rollupDepartments: [], // renamed from departments
  departments: [], // new - for child departments
  accounts: [],
  pastYears: [],
  forecastMethods: []
});

  // Debug logs to check what props are being received
  console.log('RevenueExpenseForecast props:', { userName, sessionId });

  // Handle filter changes from RevenueFilter component
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Fetch forecast data using TanStack React Query
  const { data: forecastData, isLoading, error, isFetching } = useQuery({
  queryKey: [
    'forecast', 
    userName, 
    sessionId, 
    filters.fundCodes, 
    filters.rollupDepartments, // renamed
    filters.departments, // new
    filters.accounts,
    filters.pastYears,
    filters.forecastMethods
  ],
  queryFn: () => {
    console.log('API call triggered with:', { 
      user_id: userName, 
      session_id: sessionId,
      fund_code: filters.fundCodes,
      parent_deptid: filters.rollupDepartments, // renamed from deptid
      deptid: filters.departments, // new - child departments
      account: filters.accounts,
      past_years: filters.pastYears, // new
      forecast_method: filters.forecastMethods // new
    });
    return getSalesFcast({ 
  user_id: userName, 
  session_id: sessionId,
  fund_code: filters.fundCodes,
  rollup_deptid: filters.rollupDepartments, // renamed from deptid
  deptid: filters.departments, // new - child departments
  account: filters.accounts,
  past_years: filters.pastYears, // new
  forecast_method: filters.forecastMethods, // new
  as_of_date: new Date().toISOString().split('T')[0],
});
  },
  enabled: !!(userName && sessionId),
  refetchOnWindowFocus: true,
});


  // Transform the API data into chart format for main forecast
  const chartData = useMemo(() => {
    console.log('Processing chartData, forecastData:', forecastData);
    
    // Updated to use historical_actuals instead of actuals
    if (!forecastData?.historical_actuals) {
      console.log('No historical_actuals found in data');
      return [];
    }

    if (!Array.isArray(forecastData.historical_actuals)) {
      console.log('historical_actuals is not an array:', typeof forecastData.historical_actuals);
      return [];
    }

    if (forecastData.historical_actuals.length === 0) {
      console.log('historical_actuals array is empty');
      return [];
    }

    // Take only first 100 records from API
    const limitedData = forecastData.historical_actuals.slice(0, 100);

    // Group data by accounting_period to create time series
    const periodData = {};
    
    limitedData.forEach((item, index) => {
      
      const period = item.accounting_period;
      const year = item.budget_year;
      const key = `${year}-P${period.toString().padStart(2, '0')}`;
      
      if (!periodData[key]) {
        periodData[key] = {
          period: key,
          year: year,
          accounting_period: period,
          budget: 0,
          actuals: 0,
          cyExpYtdActuals: 0,
          cyRevYtdActuals: 0,
          fundCodes: new Set(),
          accounts: new Set(),
          parentDeptId: null, // Store single value instead of Set
        };
      }
      
      // Handle potential null/undefined values and "NULL" strings
      const budget = parseFloat(item.budget) || 0;
      const actuals = parseFloat(item.actuals) || 0;
      const cyExpYtdActuals = parseFloat(item.cy_exp_ytd_actuals) || 0;
      const cyRevYtdActuals = parseFloat(item.cy_rev_ytd_actuals) || 0;
      
      // Aggregate the four required metrics (ensure no negative values)
      periodData[key].budget = Math.max(0, periodData[key].budget + budget);
      periodData[key].actuals = Math.max(0, periodData[key].actuals + actuals);
      periodData[key].cyExpYtdActuals = Math.max(0, periodData[key].cyExpYtdActuals + cyExpYtdActuals);
      periodData[key].cyRevYtdActuals = Math.max(0, periodData[key].cyRevYtdActuals + cyRevYtdActuals);
      
      // Collect fund codes and accounts (avoid duplicates with Set)
      if (item.fund_code && item.fund_code !== 'NULL' && item.fund_code !== null) {
        periodData[key].fundCodes.add(item.fund_code);
      }
      if (item.account && item.account !== 'NULL' && item.account !== null) {
        periodData[key].accounts.add(item.account);
      }
      
      // Store single parent_deptid value (take the first valid one found)
      if (item.parent_deptid && item.parent_deptid !== 'NULL' && item.parent_deptid !== null && !periodData[key].parentDeptId) {
        periodData[key].parentDeptId = item.parent_deptid;
      }
    });


    // Convert to array and sort by period
    const result = Object.values(periodData)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.accounting_period - b.accounting_period;
      })
      .map(item => ({
        year: item.period,
        budget: Math.max(0, item.budget), // Ensure no negative values
        actuals: Math.max(0, item.actuals), // Ensure no negative values
        cyExpYtdActuals: Math.max(0, item.cyExpYtdActuals), // Ensure no negative values
        cyRevYtdActuals: Math.max(0, item.cyRevYtdActuals), // Ensure no negative values
        fundCodes: Array.from(item.fundCodes), // Convert Set to Array
        accounts: Array.from(item.accounts), // Convert Set to Array
        parentDeptId: item.parentDeptId, // Single value as received from API
      }));

    console.log('Final chart data:', result);
    return result;
  }, [forecastData]);

  // Add more detailed logging
  console.log('Component render state:', {
    isLoading,
    isFetching,
    hasError: !!error,
    hasData: !!forecastData,
    chartDataLength: chartData.length,
    userName,
    sessionId
  });

  // Check if we're still loading (either initial load or refetching)
  if (isLoading && !forecastData) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
          {/* Keep Filters Visible During Loading */}
          <RevenueExpenseForecastFilter 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
          
          <RevenueExpenseForecastSkeleton />
        </div>
        
        {/* Loading skeleton for 12-month forecast */}
        <RevenueExpenseForecastSkeleton />

      </div>
    );
  }

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
          {/* Keep Filters Visible During Error */}
          <RevenueExpenseForecastFilter 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
          
          <div className="flex items-center justify-center h-96">
            <div className="text-red-500">Error loading forecast data: {error.message}</div>
          </div>
        </div>
        
        {/* Error state for 12-month forecast */}
        <TwelveMonthForecast 
          forecastData={forecastData}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
        />
      </div>
    );
  }

  // Check if we have data but no chart data (could be all zeros)
  if (forecastData && !chartData.length) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
          {/* Keep Filters Visible When No Chart Data */}
          <RevenueExpenseForecastFilter
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
          
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">
              No historical chart data available (received {forecastData?.historical_actuals?.length || 0} records)
            </div>
          </div>
        </div>
        
        {/* Still show 12-month forecast even if historical data is empty */}
        <TwelveMonthForecast 
          forecastData={forecastData}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
        />
      </div>
    );
  }

  // Show both charts
  return (
    <div className="space-y-8">
      {/* Original Revenue & Expense Forecast Chart */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
        {/* Filters Section */}
       <RevenueExpenseForecastFilter 
  onFiltersChange={handleFiltersChange}
  initialFilters={filters} // This now includes all the new filter properties
/>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Revenue & Expense Forecast
            {isFetching && (
              <span className="ml-2 text-sm text-blue-500">(Updating...)</span>
            )}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-3 h-3 bg-indigo-600 rounded mr-2"></div>
              Budget
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-3 h-3 bg-rose-600 rounded mr-2"></div>
              Actuals
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-3 h-3 bg-teal-600 rounded mr-2"></div>
              CY Exp YTD Actuals
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-3 h-3 bg-amber-600 rounded mr-2"></div>
              CY Rev YTD Actuals
            </div>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#6b7280" />
              <YAxis 
                tickFormatter={formatCurrency} 
                stroke="#6b7280"
                domain={[0, 'dataMax']}
              />
              {/* Use the custom tooltip instead of the passed one */}
              <Tooltip content={<CustomForecastTooltip/>} />
              
              {/* Four required data lines with totally different colors */}
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#4f46e5" 
                strokeWidth={3}
                name="Budget"
              />
              <Line 
                type="monotone" 
                dataKey="actuals" 
                stroke="#e11d48" 
                strokeWidth={3}
                name="Actuals"
              />
              <Line 
                type="monotone" 
                dataKey="cyExpYtdActuals" 
                stroke="#0d9488" 
                strokeWidth={3}
                name="CY Exp YTD Actuals"
              />
              <Line 
                type="monotone" 
                dataKey="cyRevYtdActuals" 
                stroke="#d97706" 
                strokeWidth={3}
                name="CY Rev YTD Actuals"
              />
              
              {/* Reference line for current period */}
              <ReferenceLine x="2025-P8" stroke="#9ca3af" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Debug info (remove in production) */}
        {
          <div className="mt-4 p-2 bg-gray-100 text-xs">
            <div>Records: {forecastData?.historical_actuals?.length || 0}</div>
            <div>Chart points: {chartData.length}</div>
            <div>Fund codes in first point: {chartData[0]?.fundCodes?.length || 0}</div>
            <div>Accounts in first point: {chartData[0]?.accounts?.length || 0}</div>
            <div>Parent Dept ID in first point: {chartData[0]?.parentDeptId || 'None'}</div>
           
          </div>
        }
      </div>

      {/* Separate 12-Month Forecast Component */}
      <TwelveMonthForecast 
        forecastData={forecastData}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
      />
    </div>
  );
};