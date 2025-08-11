import React, { useState } from 'react';
import { Bot, MessageCircle, RotateCcw, ChevronLeft, ChevronRight, FileText, TrendingUp, Users, Calendar, ChevronDown, ChevronUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Summary Component
const Summary = ({ isVisible, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <div className="h-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-colors"
       
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Report Summary</h2>
          </div>
        
        </div>
      </div>

      {/* All Content - Expandable */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="p-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Records</span>
                </div>
                <span className="text-lg font-bold text-blue-600">1,247</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">Active Users</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">892</span>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Last Updated</span>
                </div>
                <span className="text-sm font-medium text-purple-600">2h ago</span>
              </div>
            </div>
          </div>
          {/* Summary Text */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
              Key Insights
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="leading-relaxed">
                <span className="font-medium text-gray-800">Performance Overview:</span> The current 
                reporting period shows significant improvement with a 23% increase in user engagement 
                and 15% growth in overall metrics.
              </p>
              <p className="leading-relaxed">
                <span className="font-medium text-gray-800">Trending Data:</span> Mobile usage 
                continues to dominate at 68% of total traffic, while desktop maintains steady 
                performance at 32%.
              </p>
              <p className="leading-relaxed">
                <span className="font-medium text-gray-800">Recommendations:</span> Focus on mobile 
                optimization and consider implementing advanced filtering options for better user experience.
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
              System Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Data Quality</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-600">Excellent</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Report Accuracy</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-600">98.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Processing Speed</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs font-medium text-yellow-600">Good</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Summary;