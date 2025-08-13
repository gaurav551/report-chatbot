import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { ReportBaseUrl, ReportFileName } from '../../const/url';

const Chart = ({isVisible, onToggle, userName, sessionId}) => {
  const [activeChart, setActiveChart] = useState('bar');

  // Fetch data using TanStack Query and Axios
  const { data, isLoading, error } = useQuery({
    queryKey: ['chartData'],
    queryFn: async () => {
      const response = await axios.get(`${ReportBaseUrl}charts/outputs/${userName}/${sessionId}/${ReportFileName}`);
      return response.data;
    },
    enabled: isVisible && !!userName && !!sessionId, // Only run query when both params are available
  });

  // Colors for pie chart
  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Prepare bar chart data from API response
  const getBarChartData = () => {
    if (!data?.expense_charts?.expense_by_dept_bar) return [];
    
    return data.expense_charts.expense_by_dept_bar.slice(0, 8).map(item => ({
      name: item.name.split(' - ')[0] || item.name,
      budget: item.budget,
      actual: item.actual,
      variance: item.variance
    }));
  };

  // Prepare pie chart data from API response
  const getPieChartData = () => {
    if (!data?.revenue_charts?.revenue_by_dept_pie) return [];
    
    return data.revenue_charts.revenue_by_dept_pie.map((item, index) => ({
      name: item.name.split(' - ')[1] || item.name,
      value: Math.round((item.actual / 1000000) * 100) / 100, // Convert to millions
      color: pieColors[index % pieColors.length]
    }));
  };

  // Custom tooltips
  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: $${(entry.value / 1000000).toFixed(2)}M`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-blue-600">{`$${payload[0].value}M`}</p>
        </div>
      );
    }
    return null;
  };

  const barChartData = getBarChartData();
  const pieChartData = getPieChartData();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Financial Dashboard</h2>
          </div>
          {!isLoading && !error && (
            <div className="flex items-center space-x-1 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setActiveChart('bar')}
                className={`p-1.5 rounded transition-colors ${
                  activeChart === 'bar' 
                    ? 'bg-white text-purple-600' 
                    : 'text-white/80 hover:text-white'
                }`}
                title="Expenses by Department"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveChart('pie')}
                className={`p-1.5 rounded transition-colors ${
                  activeChart === 'pie' 
                    ? 'bg-white text-purple-600' 
                    : 'text-white/80 hover:text-white'
                }`}
                title="Revenue by Department"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading state */}
        {isLoading && (
          <div className="h-96 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading chart data...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="h-96 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <span>Error loading data: {error.message}</span>
            </div>
          </div>
        )}

        {/* Chart Content - Only show when not loading and no error */}
        {!isLoading && !error && (
          <>
            {activeChart === 'bar' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Expenses by Department</h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Budget</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Actual</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip content={<BarTooltip />} />
                      <Bar 
                        dataKey="budget" 
                        fill="#3B82F6" 
                        radius={[2, 2, 0, 0]}
                        name="Budget"
                      />
                      <Bar 
                        dataKey="actual" 
                        fill="#10B981" 
                        radius={[2, 2, 0, 0]}
                        name="Actual"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      ${(data?.budget_vs_actual?.expense_comparison?.[0]?.amount / 1000000 || 0).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-600">Total Budget</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      ${(data?.budget_vs_actual?.expense_comparison?.[1]?.amount / 1000000 || 0).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-600">Total Actual</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">
                      ${(data?.budget_vs_actual?.expense_comparison?.[3]?.amount / 1000000 || 0).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-600">Variance</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Revenue by Department</h3>
                  <div className="text-xs text-gray-500">In millions ($M)</div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {pieChartData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-700">{entry.name}</span>
                      </div>
                      <span className="font-medium text-gray-800">${entry.value}M</span>
                    </div>
                  ))}
                </div>

                {/* Total Revenue */}
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Total Revenue</div>
                  <div className="text-xl font-bold text-purple-600">
                    ${(data?.budget_vs_actual?.revenue_comparison?.[1]?.amount / 1000000 || 0).toFixed(1)}M
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chart;