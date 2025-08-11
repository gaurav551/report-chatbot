import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const Chart = ({ isVisible, onToggle }) => {
  const [activeChart, setActiveChart] = useState('bar');
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Sample data for bar chart
  const barData = [
    { name: 'Jan', value: 400, growth: 12 },
    { name: 'Feb', value: 300, growth: 8 },
    { name: 'Mar', value: 600, growth: 25 },
    { name: 'Apr', value: 800, growth: 33 },
    { name: 'May', value: 500, growth: 15 },
    { name: 'Jun', value: 900, growth: 45 }
  ];

  // Sample data for pie chart
  const pieData = [
    { name: 'Desktop', value: 32, color: '#3B82F6' },
    { name: 'Mobile', value: 68, color: '#10B981' },
    { name: 'Tablet', value: 15, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#EF4444' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{`${label}`}</p>
          <p className="text-blue-600">
            {`Value: ${payload[0].value}`}
          </p>
          {activeChart === 'bar' && payload[0].payload.growth && (
            <p className="text-green-600 text-sm">
              {`Growth: +${payload[0].payload.growth}%`}
            </p>
          )}
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
          <p className="text-blue-600">
            {`${payload[0].value}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!isVisible) return null;

  return (
    <div className="h-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-colors"
        
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
          </div>
          <div className="flex items-center space-x-3">
            {isExpanded && (
              <div className="flex items-center space-x-1 bg-white/20 rounded-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChart('bar');
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    activeChart === 'bar' 
                      ? 'bg-white text-purple-600' 
                      : 'text-white/80 hover:text-white'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChart('pie');
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    activeChart === 'pie' 
                      ? 'bg-white text-purple-600' 
                      : 'text-white/80 hover:text-white'
                  }`}
                  title="Pie Chart"
                >
                  <PieChart className="w-4 h-4" />
                </button>
              </div>
            )}
           
          </div>
        </div>
      </div>

      {/* All Chart Content - Expandable */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="p-4">
          {activeChart === 'bar' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Monthly Performance</h3>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Revenue Growth</span>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">6</div>
                  <div className="text-xs text-gray-600">Months</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">3,500</div>
                  <div className="text-xs text-gray-600">Total Value</div>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-green-600">+23%</div>
                  <div className="text-xs text-gray-600">Avg Growth</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Device Distribution</h3>
                <div className="text-xs text-gray-500">Last 30 days</div>
              </div>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart Legend */}
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-gray-700">{entry.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{entry.value}%</span>
                  </div>
                ))}
              </div>

              {/* Pie Chart Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Dominant Platform</div>
                <div className="text-lg font-bold text-green-600">Mobile - 68%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Chart;