import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Loader2, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { ReportBaseUrl, ReportFileName } from '../../const/url';

const Chart = ({isVisible, onToggle, userName, sessionId}) => {
  const [activeChart, setActiveChart] = useState('bar');
  const [hiddenItems, setHiddenItems] = useState(new Set());

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

  // Toggle item visibility
  const toggleItemVisibility = (id) => {
    setHiddenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Helper function to abbreviate long names
  const abbreviateName = (name) => {
    const abbreviations = {
      'Maintenance & Operations': 'Maintenance\n& Operations',
      'Others': 'Others',
      'Payroll': 'Payroll'
    };
    return abbreviations[name] || name;
  };

  // Prepare bar chart data from expense_by_tree_bar with filter
  const getBarChartData = () => {
    if (!data?.expense_charts?.expense_by_tree_bar) return [];
    
    return data.expense_charts.expense_by_tree_bar
      .map(item => ({
        id: item.name,
        name: abbreviateName(item.name),
        fullName: item.name, // Keep full name for tooltips
        budget: item.budget,
        actual: item.actual,
        variance: item.variance,
        encumbered: item.encumbered
      }))
      .filter(item => !hiddenItems.has(item.id));
  };

  // Prepare pie chart data with balanced visualization and filter
  const getPieChartData = () => {
    if (!data?.revenue_charts?.revenue_by_dept_pie) return [];
    
    const filteredData = data.revenue_charts.revenue_by_dept_pie.filter(item => item.actual > 0);
    const visibleData = filteredData.filter((item) => !hiddenItems.has(item.name));
    const total = visibleData.reduce((sum, item) => sum + item.actual, 0);
    
    return visibleData.map((item, index) => {
      const actualValue = Math.round((item.actual / 1000000) * 100) / 100;
      const percentage = (item.actual / total * 100).toFixed(1);
      
      // Use square root scaling to make smaller values more visible
      const scaledValue = Math.sqrt(item.actual);
      
      return {
        id: item.name,
        name: item.name.split(' - ')[1] || item.name,
        value: scaledValue, // Use scaled value for pie chart
        actualValue: actualValue, // Keep actual value for display
        percentage: percentage,
        color: pieColors[index % pieColors.length]
      };
    });
  };

  // Get legend data
  const getLegendData = () => {
    if (activeChart === 'bar') {
      if (!data?.expense_charts?.expense_by_tree_bar) return [];
      return data.expense_charts.expense_by_tree_bar.map(item => ({
        id: item.name,
        name: item.name, // Use full name for legend
        value: item.actual,
        color: null
      }));
    } else {
      if (!data?.revenue_charts?.revenue_by_dept_pie) return [];
      return data.revenue_charts.revenue_by_dept_pie
        .filter(item => item.actual > 0)
        .map((item, index) => ({
          id: item.name,
          name: item.name.split(' - ')[1] || item.name,
          value: item.actual,
          color: pieColors[index % pieColors.length]
        }));
    }
  };

  // Custom tooltips
  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the full name from the data
      const dataItem = barChartData.find(item => item.name === label);
      const displayName = dataItem?.fullName || label;
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-2">{displayName}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${(entry.value / 1000000).toFixed(2)}M`}
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
          <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
          <p className="text-blue-600">${payload[0].payload.actualValue}M</p>
          <p className="text-gray-500 text-sm">{payload[0].payload.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const barChartData = getBarChartData();
  const pieChartData = getPieChartData();
  const legendData = getLegendData();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Financial Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Toggle Buttons - Only show when data is loaded */}
            {!isLoading && !error && (
              <div className="flex items-center space-x-1 bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setActiveChart('bar')}
                  className={`p-1.5 rounded transition-colors ${
                    activeChart === 'bar' 
                      ? 'bg-white text-purple-600' 
                      : 'text-white/80 hover:text-white'
                  }`}
                  title="Expenses by Category"
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
                  <PieChartIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* View Toggle Button */}
            <button
              onClick={onToggle}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={isVisible ? "Minimize Dashboard" : "Expand Dashboard"}
            >
              {isVisible ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content - Only show when isVisible is true */}
      {isVisible && (
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
                    <h3 className="text-sm font-semibold text-gray-800">Expenses by Category</h3>
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
                          interval={0}
                          height={60}
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

                  {/* Chart.js-like Interactive Legend */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Legend (click to toggle)</h4>
                    <div className="flex flex-wrap gap-2">
                      {legendData.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleItemVisibility(item.id)}
                          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border transition-all ${
                            hiddenItems.has(item.id)
                              ? 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-50'
                              : 'bg-white text-gray-700 border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500">
                            ${(item.value / 1000000).toFixed(1)}M
                          </span>
                        </button>
                      ))}
                    </div>
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
                          paddingAngle={1}
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

                  {/* Chart.js-like Interactive Legend */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Legend (click to toggle)</h4>
                    <div className="flex flex-wrap gap-2">
                      {legendData.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleItemVisibility(item.id)}
                          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border transition-all ${
                            hiddenItems.has(item.id)
                              ? 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-50'
                              : 'bg-white text-gray-700 border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: hiddenItems.has(item.id) ? '#d1d5db' : item.color }}
                          />
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500">
                            ${(item.value / 1000000).toFixed(1)}M
                          </span>
                        </button>
                      ))}
                    </div>
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
      )}
    </div>
  );
};

export default Chart;