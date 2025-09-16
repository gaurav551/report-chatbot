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
import { formatCurrency } from '../../../utils/formatCurrency';
import { getSalesFcast } from '../../../services/chatService';

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
        
        {/* Show single parent_deptid as received from API */}
        {payload[0]?.payload?.parentDeptId && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Parent Dept ID:</p>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              {payload[0].payload.parentDeptId}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const RevenueExpenseForecast = ({ CustomTooltip, userName, sessionId }) => {
  // Filter state - managed by RevenueFilter component
  const [filters, setFilters] = useState({
    fundCodes: [],
    departments: [],
    accounts: []
  });

  // Debug logs to check what props are being received
  console.log('RevenueExpenseForecast props:', { userName, sessionId });

  // Handle filter changes from RevenueFilter component
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Fetch forecast data using TanStack React Query
  const { data: forecastData, isLoading, error, isFetching } = useQuery({
    queryKey: ['forecast', userName, sessionId, filters.fundCodes, filters.departments, filters.accounts],
    queryFn: () => {
      console.log('API call triggered with:', { 
        user_id: userName, 
        session_id: sessionId,
        fund_code: filters.fundCodes,
        deptid: filters.departments
      });
      return getSalesFcast({ 
        user_id: userName, 
        session_id: sessionId,
        fund_code: filters.fundCodes,
        deptid: filters.departments,
        account: filters.accounts
      });
    },
    enabled: !!(userName && sessionId),
    refetchOnWindowFocus: true,
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
const key = `${year}-${period.toString().padStart(2, '0')}`;
      
      if (!periodData[key]) {
        periodData[key] = {
          period: key,
          year: year,
          accounting_period: period,
          pyRevBudget: 0,
          pyExpBudget: 0,
          pyRevActuals: 0,
          pyExpActuals: 0,
          fundCodes: new Set(),
          accounts: new Set(),
          parentDeptId: null, // Store single value instead of Set
        };
      }
      
      // Handle potential null/undefined values and "NULL" strings
      const pyRevBudget = parseFloat(item.py_rev_budget) || 0;
      const pyExpBudget = parseFloat(item.py_exp_budget) || 0;
      const pyRevActuals = parseFloat(item.py_rev_actuals) || 0;
      const pyExpActuals = parseFloat(item.py_exp_actuals) || 0;
      
      // Aggregate the four required metrics (ensure no negative values)
      periodData[key].pyRevBudget = Math.max(0, periodData[key].pyRevBudget + pyRevBudget);
      periodData[key].pyExpBudget = Math.max(0, periodData[key].pyExpBudget + pyExpBudget);
      periodData[key].pyRevActuals = Math.max(0, periodData[key].pyRevActuals + pyRevActuals);
      periodData[key].pyExpActuals = Math.max(0, periodData[key].pyExpActuals + pyExpActuals);
      
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

    console.log('Period data grouped:', periodData);

    // Convert to array and sort by period
    const result = Object.values(periodData)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.accounting_period - b.accounting_period;
      })
      .map(item => ({
        year: item.period,
        pyRevBudget: Math.max(0, item.pyRevBudget), // Ensure no negative values
        pyExpBudget: Math.max(0, item.pyExpBudget), // Ensure no negative values
        pyRevActuals: Math.max(0, item.pyRevActuals), // Ensure no negative values
        pyExpActuals: Math.max(0, item.pyExpActuals), // Ensure no negative values
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
      <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
        {/* Keep Filters Visible During Loading */}
        <RevenueExpenseForecastFilter 
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />
        
        <RevenueExpenseForecastSkeleton />
      </div>
    );
  }

  if (error) {
    console.error('Query error:', error);
    return (
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
    );
  }

  // Check if we have data but no chart data (could be all zeros)
  if (forecastData && !chartData.length) {
    return (
      <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
        {/* Keep Filters Visible When No Chart Data */}
        <RevenueExpenseForecastFilter
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />
        
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
      {/* Filters Section */}
      <RevenueExpenseForecastFilter
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
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
            PY Rev Budget
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-3 h-3 bg-rose-600 rounded mr-2"></div>
            PY Exp Budget
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-3 h-3 bg-teal-600 rounded mr-2"></div>
            PY Rev Actuals
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-3 h-3 bg-amber-600 rounded mr-2"></div>
            PY Exp Actuals
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
            <Tooltip content={<CustomForecastTooltip />} />
            
            {/* Four required data lines with totally different colors */}
            <Line 
              type="monotone" 
              dataKey="pyRevBudget" 
              stroke="#4f46e5" 
              strokeWidth={3}
              name="PY Rev Budget"
            />
            <Line 
              type="monotone" 
              dataKey="pyExpBudget" 
              stroke="#e11d48" 
              strokeWidth={3}
              name="PY Exp Budget"
            />
            <Line 
              type="monotone" 
              dataKey="pyRevActuals" 
              stroke="#0d9488" 
              strokeWidth={3}
              name="PY Rev Actuals"
            />
            <Line 
              type="monotone" 
              dataKey="pyExpActuals" 
              stroke="#d97706" 
              strokeWidth={3}
              name="PY Exp Actuals"
            />
            
            {/* Reference line for current period */}
            <ReferenceLine x="2025-P8" stroke="#9ca3af" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Debug info (remove in production) */}
      {(localStorage.getItem('user')) === 'admin' && (
  <div className="mt-4 p-2 bg-gray-100 text-xs">
    <div>Records: {forecastData?.forecast_workspace?.length || 0}</div>
    <div>Chart points: {chartData.length}</div>
    <div>Sample data: {JSON.stringify(chartData.slice(0, 2))}</div>
    <div>Fund codes in first point: {chartData[0]?.fundCodes?.length || 0}</div>
    <div>Accounts in first point: {chartData[0]?.accounts?.length || 0}</div>
    <div>Parent Dept ID in first point: {chartData[0]?.parentDeptId || 'None'}</div>
    <div className="mt-1">
      <strong>Current filters:</strong> Fund Codes: [{filters.fundCodes.join(', ')}],
      Departments: [{filters.departments.join(', ')}]
    </div>
  </div>
)}
    </div>
  );
};