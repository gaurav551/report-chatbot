import React from 'react';
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

export const HistoricalChart = ({ data, isFetching }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          Revenue & Expense Forecast
          {isFetching && <span className="ml-2 text-sm text-blue-500">(Updating...)</span>}
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" stroke="#6b7280" />
            <YAxis 
              tickFormatter={formatCurrency} 
              stroke="#6b7280"
              domain={[0, 'dataMax']}
            />
            <Tooltip content={<CommonTooltip showMetadata={true} />} />
            
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
            
            <ReferenceLine x="2025-P8" stroke="#9ca3af" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data summary */}
      <div className="mt-4 p-2 bg-gray-100 text-xs">
        <div>Chart points: {data?.length || 0}</div>
        <div>Fund codes in first point: {data?.[0]?.fundCodes?.length || 0}</div>
        <div>Accounts in first point: {data?.[0]?.accounts?.length || 0}</div>
        <div>Departments in first point: {data?.[0]?.departments?.length || 0}</div>
        <div>Parent Dept IDs in first point: {data?.[0]?.parentDeptIds?.length || 0}</div>
      </div>
    </>
  );
};