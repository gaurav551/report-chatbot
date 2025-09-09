import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
  AreaChart,
  ReferenceLine 
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { getSalesFcast } from '../../services/chatService';
import { RevenueExpenseForecastSkeleton } from './RevenueExpenseForecastSkeleton';

// Custom Tooltip Component
const CustomForecastTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{`Period: ${label}`}</p>
        
        {payload.map((entry, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {formatCurrency(entry.value)}
            </p>
          </div>
        ))}
        
        {/* Show fund codes and accounts if available */}
        {payload[0]?.payload?.fundCodes && payload[0].payload.fundCodes.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Fund Codes:</p>
            <div className="flex flex-wrap gap-1">
              {payload[0].payload.fundCodes.slice(0, 5).map((code, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {code}
                </span>
              ))}
              {payload[0].payload.fundCodes.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{payload[0].payload.fundCodes.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {payload[0]?.payload?.accounts && payload[0].payload.accounts.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Accounts:</p>
            <div className="flex flex-wrap gap-1">
              {payload[0].payload.accounts.slice(0, 3).map((account, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {account}
                </span>
              ))}
              {payload[0].payload.accounts.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{payload[0].payload.accounts.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const RevenueExpenseForecast = ({ CustomTooltip, userName, sessionId }) => {
  // Debug logs to check what props are being received
  console.log('RevenueExpenseForecast props:', { userName, sessionId });

  // Fetch forecast data using TanStack React Query
  const { data: forecastData, isLoading, error, isFetching } = useQuery({
    queryKey: ['forecast', userName, sessionId],
    queryFn: () => {
      console.log('API call triggered with:', { user_id: userName, session_id: sessionId });
      return getSalesFcast({ user_id: userName, session_id: sessionId });
    },
    enabled: !!(userName && sessionId), // Only run query if both params exist
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('Query state:', { 
    isLoading, 
    isFetching, 
    error, 
    hasData: !!forecastData,
    forecastDataKeys: forecastData ? Object.keys(forecastData) : null,
    forecastWorkspaceLength: forecastData?.forecast_workspace?.length || 0
  });

  // Transform the API data into chart format
  const chartData = useMemo(() => {
    console.log('Processing chartData, forecastData:', forecastData);
    
    if (!forecastData?.forecast_workspace) {
      console.log('No forecast_workspace found in data');
      return [];
    }

    if (!Array.isArray(forecastData.forecast_workspace)) {
      console.log('forecast_workspace is not an array:', typeof forecastData.forecast_workspace);
      return [];
    }

    if (forecastData.forecast_workspace.length === 0) {
      console.log('forecast_workspace array is empty');
      return [];
    }

    // Take only first 100 records from API
    const limitedData = forecastData.forecast_workspace.slice(0, 100);
    console.log('Using first 100 records:', limitedData.length);

    // Group data by accounting_period to create time series
    const periodData = {};
    
    limitedData.forEach((item, index) => {
      console.log(`Processing item ${index}:`, item);
      
      const period = item.accounting_period;
      const year = item.budget_year;
      const key = `${year}-P${period}`;
      
      if (!periodData[key]) {
        periodData[key] = {
          period: key,
          year: year,
          accounting_period: period,
          totalExpenses: 0,
          totalRevenue: 0,
          fundCodes: new Set(),
          accounts: new Set(),
        };
      }
      
      // Handle potential null/undefined values and "NULL" strings
      const cyExpYtd = parseFloat(item.cy_exp_ytd_actuals) || 0;
      const pyExpActuals = parseFloat(item.py_exp_actuals) || 0;
      const cyRevYtd = parseFloat(item.cy_rev_ytd_actuals) || 0;
      const pyRevActuals = parseFloat(item.py_rev_actuals) || 0;
      
      // Aggregate expenses and revenue (ensure no negative values)
      periodData[key].totalExpenses = Math.max(0, periodData[key].totalExpenses + cyExpYtd + pyExpActuals);
      periodData[key].totalRevenue = Math.max(0, periodData[key].totalRevenue + cyRevYtd + pyRevActuals);
      
      // Collect fund codes and accounts (avoid duplicates with Set)
      if (item.fund_code && item.fund_code !== 'NULL' && item.fund_code !== null) {
        periodData[key].fundCodes.add(item.fund_code);
      }
      if (item.account && item.account !== 'NULL' && item.account !== null) {
        periodData[key].accounts.add(item.account);
      }
    });

    console.log('Period data grouped:', periodData);

    // Convert to array and sort by period
    const result = Object.values(periodData)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.accounting_period - b.accounting_period;
      })
      .map(item => ({
        year: item.period,
        revenue: Math.max(0, item.totalRevenue), // Ensure no negative values
        expenses: Math.max(0, item.totalExpenses), // Ensure no negative values
        fundCodes: Array.from(item.fundCodes), // Convert Set to Array
        accounts: Array.from(item.accounts), // Convert Set to Array
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
      <RevenueExpenseForecastSkeleton />
    );
  }

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500">Error loading forecast data: {error.message}</div>
        </div>
      </div>
    );
  }

  // Check if we have data but no chart data (could be all zeros)
  if (forecastData && !chartData.length) {
    return (
      <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">
            No chart data available (received {forecastData?.forecast_workspace?.length || 0} records)
          </div>
        </div>
      </div>
    );
  }

  // Show loading indicator if we're refetching but still show the chart
  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          Revenue & Expense Forecast
          {isFetching && (
            <span className="ml-2 text-sm text-blue-500">(Updating...)</span>
          )}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            Revenue
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            Expenses
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" stroke="#6b7280" />
            <YAxis 
              tickFormatter={formatCurrency} 
              stroke="#6b7280"
              domain={[0, 'dataMax']}
            />
            {/* Use the custom tooltip instead of the passed one */}
            <Tooltip content={<CustomForecastTooltip />} />
            
            {/* Main prediction lines */}
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fill="url(#revenueGradient)"
              name="Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={3}
              strokeDasharray="8 4"
              name="Expenses"
            />
            
            {/* Reference line for current period */}
            <ReferenceLine x="2025-P8" stroke="#9ca3af" strokeDasharray="2 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Debug info (remove in production) */}
        <div className="mt-4 p-2 bg-gray-100 text-xs">
          <div>Records: {forecastData?.forecast_workspace?.length || 0}</div>
          <div>Chart points: {chartData.length}</div>
          <div>Sample data: {JSON.stringify(chartData.slice(0, 2))}</div>
          <div>Fund codes in first point: {chartData[0]?.fundCodes?.length || 0}</div>
          <div>Accounts in first point: {chartData[0]?.accounts?.length || 0}</div>
        </div>
    
    </div>
  );
};