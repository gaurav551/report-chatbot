import React, { useMemo, useState } from 'react';
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
import { formatCurrency } from '../../../utils/formatCurrency';

// Custom tooltip for forecast data
const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white p-4 border rounded shadow-lg">
      <p className="font-medium">{`Period: ${label}`}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {`${entry.name}: ${formatCurrency(entry.value)}`}
        </p>
      ))}
    </div>
  );
};

export const TwelveMonthForecast = ({ forecastData, isLoading, isFetching, error }) => {
  // State to track hovered data point
  const [hoveredData, setHoveredData] = useState(null);
  
  // Process forecast data into chart format
  const chartData = useMemo(() => {
    console.log('TwelveMonthForecast - Processing forecast data:', forecastData);

    // Return empty array if no forecast data
    if (!forecastData || !forecastData.forecast || !Array.isArray(forecastData.forecast)) {
      console.log('TwelveMonthForecast - No valid forecast array found');
      return [];
    }

    if (forecastData.forecast.length === 0) {
      console.log('TwelveMonthForecast - Empty forecast array');
      return [];
    }

    // Create a map to aggregate data by time period
    const periodMap = new Map();

    // Process each forecast record
    forecastData.forecast.forEach((record, index) => {
      console.log(`TwelveMonthForecast - Processing record ${index}:`, record);

      const year = parseInt(record.budget_year) || new Date().getFullYear();
      const month = parseInt(record.month_num) || 1;
      
      // Create period key (YYYY-MM format)
      const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      // Initialize period data if it doesn't exist
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          period: periodKey,
          year: year,
          month: month,
          linear: 0,
          yoy: 0,
          mavg: 0,
          total: 0
        });
      }

      const periodData = periodMap.get(periodKey);

      // Add values from the record (they're already separated by method)
      const linearValue = parseFloat(record.linear) || 0;
      const yoyValue = parseFloat(record.yoy) || 0;
      const mavgValue = parseFloat(record.mavg) || 0;

      periodData.linear += linearValue;
      periodData.yoy += yoyValue;
      periodData.mavg += mavgValue;
      periodData.total += linearValue + yoyValue + mavgValue;
    });

    // Convert map to array and sort by period
    const result = Array.from(periodMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    console.log('TwelveMonthForecast - Final chart data:', result);
    return result;

  }, [forecastData]);

  // Create a custom tooltip wrapper that handles hover state
  const CustomTooltipWrapper = ({ active, payload, label }) => {
    // Only update hover state when actively hovering over a data point (don't clear on mouse out)
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const newHoverData = {
        period: label,
        linear: data.linear,
        yoy: data.yoy,
        mavg: data.mavg,
        total: data.total
      };
      
      // Only update if the data has actually changed to prevent infinite loops
      if (!hoveredData || JSON.stringify(hoveredData) !== JSON.stringify(newHoverData)) {
        setHoveredData(newHoverData);
      }
    }
    // Note: We don't clear hoveredData when active=false, so values persist

    return <ForecastTooltip active={active} payload={payload} label={label} />;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">12-Month Forecast</h2>
        <RevenueExpenseForecastSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">12-Month Forecast</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load forecast data</div>
            <div className="text-sm text-gray-500">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          12-Month Forecast
          {isFetching && <span className="ml-2 text-sm text-blue-500">(Updating...)</span>}
        </h2>
        
        {chartData.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            {chartData.some(d => d.linear > 0) && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                Linear Forecast
              </div>
            )}
            {chartData.some(d => d.yoy > 0) && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                Year-over-Year
              </div>
            )}
            {chartData.some(d => d.mavg > 0) && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                Moving Average
              </div>
            )}
           
          </div>
        )}
      </div>

      {/* Chart or No Data Message */}
      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="period" 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={CustomTooltipWrapper} />
              
              {/* Render lines based on available data */}
              {chartData.some(d => d.linear > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="linear" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Linear"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              )}
              
              {chartData.some(d => d.yoy > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="yoy" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Year-over-Year"
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              )}
              
              {chartData.some(d => d.mavg > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="mavg" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Moving Average"
                  strokeDasharray="8 4"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              )}

             
              
              {/* Current period reference line */}
              <ReferenceLine x="2025-09" stroke="#6b7280" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">No Forecast Data Available</div>
            <div className="text-sm text-gray-400">
              {forecastData?.forecast ? 
                `Received ${forecastData.forecast.length} forecast records, but none could be processed` : 
                'No forecast data found in API response'
              }
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
        <div className="font-semibold mb-1">Debug Info:</div>
        <div>API Records: {forecastData?.forecast?.length || 0}</div>
        <div>Chart Data Points: {chartData.length}</div>
        {chartData.length > 0 && (
          <>
            <div>Date Range: {chartData[0]?.period} to {chartData[chartData.length - 1]?.period}</div>
            <div>Has Linear: {chartData.some(d => d.linear > 0) ? 'Yes' : 'No'}</div>
            <div>Has YoY: {chartData.some(d => d.yoy > 0) ? 'Yes' : 'No'}</div>
            <div>Has Moving Avg: {chartData.some(d => d.mavg > 0) ? 'Yes' : 'No'}</div>
          </>
        )}
        
        {/* Hovered Values Section */}
        {hoveredData && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <div className="font-semibold mb-1">Selected Values (Click to copy):</div>
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="cursor-pointer hover:bg-gray-200 px-1 rounded" 
                onClick={() => navigator.clipboard.writeText(hoveredData.period)}
                title="Click to copy"
              >
                Period: {hoveredData.period}
              </div>
              <div 
                className="cursor-pointer hover:bg-gray-200 px-1 rounded" 
                onClick={() => navigator.clipboard.writeText(formatCurrency(hoveredData.total))}
                title="Click to copy"
              >
                Total: {formatCurrency(hoveredData.total)}
              </div>
              {hoveredData.linear > 0 && (
                <div 
                  className="text-blue-600 cursor-pointer hover:bg-gray-200 px-1 rounded" 
                  onClick={() => navigator.clipboard.writeText(formatCurrency(hoveredData.linear))}
                  title="Click to copy"
                >
                  Linear: {formatCurrency(hoveredData.linear)}
                </div>
              )}
              {hoveredData.yoy > 0 && (
                <div 
                  className="text-green-600 cursor-pointer hover:bg-gray-200 px-1 rounded" 
                  onClick={() => navigator.clipboard.writeText(formatCurrency(hoveredData.yoy))}
                  title="Click to copy"
                >
                  Year-over-Year: {formatCurrency(hoveredData.yoy)}
                </div>
              )}
              {hoveredData.mavg > 0 && (
                <div 
                  className="text-orange-600 cursor-pointer hover:bg-gray-200 px-1 rounded" 
                  onClick={() => navigator.clipboard.writeText(formatCurrency(hoveredData.mavg))}
                  title="Click to copy"
                >
                  Moving Average: {formatCurrency(hoveredData.mavg)}
                </div>
              )}
            </div>
          </div>
        )}
        
        {!hoveredData && chartData.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300 text-gray-500">
            Hover over the chart to see values here
          </div>
        )}
      </div>
    </div>
  );
};