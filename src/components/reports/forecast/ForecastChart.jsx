import React, { useState } from 'react';
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
import { formatCurrency } from '../../../utils/formatCurrency';
import { CommonTooltip } from './CommonTooltip';



export const ForecastChart = ({ data, isFetching }) => {
  const [hoveredData, setHoveredData] = useState(null);

  const CustomTooltipWrapper = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const newHoverData = {
      period: label,
      linear: data.linear,
      yoy: data.yoy,
      mavg: data.mavg,
      total: data.total
    };
    
    if (!hoveredData || JSON.stringify(hoveredData) !== JSON.stringify(newHoverData)) {
      setHoveredData(newHoverData);
    }
  }

  return <CommonTooltip active={active} payload={payload} label={label} />;
};

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          12-Month Forecast
          {isFetching && <span className="ml-2 text-sm text-blue-500">(Updating...)</span>}
        </h2>
        
        {data.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            {data.some(d => d.linear > 0) && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                Linear Forecast
              </div>
            )}
            {data.some(d => d.yoy > 0) && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                Year-over-Year
              </div>
            )}
            {data.some(d => d.mavg > 0) && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                Moving Average
              </div>
            )}
          </div>
        )}
      </div>

      {data.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={CustomTooltipWrapper} />
              
              {data.some(d => d.linear > 0) && (
                <Line 
                  type="monotone" 
                  dataKey="linear" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Linear"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              )}
              
              {data.some(d => d.yoy > 0) && (
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
              
              {data.some(d => d.mavg > 0) && (
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

              <ReferenceLine x="2025-09" stroke="#6b7280" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">No Forecast Data Available</div>
          </div>
        </div>
      )}

      {/* Hovered Values */}
      {hoveredData && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="font-semibold mb-2">Selected Values:</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Period: {hoveredData.period}</div>
            <div>Total: {formatCurrency(hoveredData.total)}</div>
            {hoveredData.linear > 0 && (
              <div className="text-blue-600">Linear: {formatCurrency(hoveredData.linear)}</div>
            )}
            {hoveredData.yoy > 0 && (
              <div className="text-green-600">YoY: {formatCurrency(hoveredData.yoy)}</div>
            )}
            {hoveredData.mavg > 0 && (
              <div className="text-orange-600">Avg: {formatCurrency(hoveredData.mavg)}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};