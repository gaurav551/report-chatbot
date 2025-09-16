import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,Area,
  AreaChart,
  ReferenceLine 
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { ReportBaseUrl, ReportFileName } from '../../../const/url';
import { predictionData } from '../../forecasting/Forecasting';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useParams } from 'react-router-dom';
import { RevenueExpenseForecast } from '../forecast/RevenueExpenseForecast';
import { AnalyticsSkeleton } from './AnalyticsSkeleton';

// Fetch function
const fetchAnalyticsData = async ({ queryKey }) => {
  const [_key, userId, userName] = queryKey;
  const response = await axios.get(
    `${ReportBaseUrl}charts/outputs/${userName}/${userId}/${ReportFileName}`
  );
  return response.data;
};

// Format currency

// Colors for charts
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

const Analytics = () => {
  const [activeChart, setActiveChart] = useState('overview');
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const { userId, username: userName } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["analyticsData", userId, userName],
    queryFn: fetchAnalyticsData,
    enabled: true,
  });

  // Process data for charts
  const getProcessedData = () => {
    if (!data) return null;

    // Budget vs Actual Summary
    const budgetVsActual = {
      revenue: {
        budget: data.budget_vs_actual?.revenue_comparison?.find(r => r.category.includes('Budget'))?.amount || 0,
        actual: data.budget_vs_actual?.revenue_comparison?.find(r => r.category.includes('Actual'))?.amount || 0,
      },
      expense: {
        budget: data.budget_vs_actual?.expense_comparison?.find(e => e.category.includes('Budget'))?.amount || 0,
        actual: data.budget_vs_actual?.expense_comparison?.find(e => e.category.includes('Actual'))?.amount || 0,
        encumbered: data.budget_vs_actual?.expense_comparison?.find(e => e.category.includes('Encumbered'))?.amount || 0,
        variance: data.budget_vs_actual?.expense_comparison?.find(e => e.category.includes('Variance'))?.amount || 0,
      }
    };

    // Expense by category (bar chart data)
    const expenseChartData = data.expense_charts?.expense_by_tree_bar?.map(item => ({
      name: item.name,
      Budget: item.budget,
      Actual: item.actual,
      Encumbered: item.encumbered,
      Variance: item.variance
    })) || [];

    // Revenue by department (pie chart data)
    const revenueChartData = data.revenue_charts?.revenue_by_dept_pie?.map(item => ({
      name: item.name.replace(/^\d{3}\s-\s/, ''), // Remove department codes
      budget: item.budget,
      actual: item.actual,
      variance: item.budget - item.actual
    })) || [];

    // Overview comparison data
    const overviewData = [
      {
        category: 'Revenue',
        Budget: budgetVsActual.revenue.budget,
        Actual: budgetVsActual.revenue.actual,
        Variance: budgetVsActual.revenue.budget - budgetVsActual.revenue.actual
      },
      {
        category: 'Expenses',
        Budget: budgetVsActual.expense.budget,
        Actual: budgetVsActual.expense.actual,
        Variance: budgetVsActual.expense.variance
      }
    ];

    return {
      budgetVsActual,
      expenseChartData,
      revenueChartData,
      overviewData
    };
  };

  const processedData = getProcessedData();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Key metrics cards
  const getKeyMetrics = () => {
    if (!processedData) return [];
    
    const { budgetVsActual } = processedData;
    const netPosition = budgetVsActual.revenue.actual - budgetVsActual.expense.actual;
    const revenueVariance = budgetVsActual.revenue.budget - budgetVsActual.revenue.actual;
    const expenseVariance = budgetVsActual.expense.variance;
    
    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(budgetVsActual.revenue.actual),
        change: formatCurrency(revenueVariance),
        isPositive: revenueVariance <= 0, // Lower variance is better for revenue
        icon: DollarSign
      },
      {
        title: 'Total Expenses',
        value: formatCurrency(budgetVsActual.expense.actual),
        change: formatCurrency(expenseVariance),
        isPositive: expenseVariance > 0, // Positive variance means under budget
        icon: TrendingUp
      },
      {
        title: 'Net Position',
        value: formatCurrency(netPosition),
        change: netPosition >= 0 ? 'Surplus' : 'Deficit',
        isPositive: netPosition >= 0,
        icon: BarChart3
      },
      {
        title: 'Encumbered Funds',
        value: formatCurrency(budgetVsActual.expense.encumbered),
        change: 'Outstanding',
        isPositive: false,
        icon: PieChartIcon
      }
    ];
  };

  const keyMetrics = getKeyMetrics();

  return (
    <div className="w-full max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Financial Analytics Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Content Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 bg-white/20 hover:bg-blue-700 rounded-lg transition-colors"
              title={isExpanded ? "Collapse Content" : "Expand Content"}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {/* View Toggle Button */}
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="p-1.5 bg-white/20 hover:bg-blue-700 rounded-lg transition-colors"
              title={isVisible ? "Hide Analytics" : "Show Analytics"}
            >
              {isVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isVisible && (
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="p-4 sm:p-6">
            {isLoading && (
             <AnalyticsSkeleton/>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-lg">Error loading analytics: {error.message}</span>
                </div>
              </div>
            )}

            {processedData && (
              <div className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {keyMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            metric.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {metric.change}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart Navigation */}
                <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200 pb-4">
                  {[
                    { key: 'overview', label: 'Budget vs Actual Overview', icon: BarChart3 },
                    { key: 'expenses', label: 'Expense Breakdown', icon: TrendingUp },
                    { key: 'revenue', label: 'Revenue by Department', icon: PieChartIcon }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveChart(key)}
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                        activeChart === key
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                      <span className="sm:hidden">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </button>
                  ))}
                </div>

                {/* Charts */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
                  {activeChart === 'overview' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Overview</h3>
                      <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={processedData.overviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="category" 
                              tick={{ fill: '#6b7280' }}
                              axisLine={{ stroke: '#d1d5db' }}
                            />
                            <YAxis 
                              tick={{ fill: '#6b7280' }}
                              axisLine={{ stroke: '#d1d5db' }}
                              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Budget" fill="#3B82F6" name="Budget" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Actual" fill="#10B981" name="Actual" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {activeChart === 'expenses' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Analysis by Category</h3>
                      <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={processedData.expenseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: '#6b7280', fontSize: 10 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                            />
                            <YAxis 
                              tick={{ fill: '#6b7280', fontSize: 11 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Budget" fill="#3B82F6" name="Budget" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="Actual" fill="#10B981" name="Actual" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="Encumbered" fill="#F59E0B" name="Encumbered" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="Variance" fill="#EF4444" name="Variance" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {activeChart === 'revenue' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution by Department</h3>
                      <div className="space-y-6">
                        {/* Revenue Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {processedData.revenueChartData.map((dept, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  dept.actual >= dept.budget * 0.9 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {((dept.actual / dept.budget) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 truncate" title={dept.name}>
                                {dept.name}
                              </h4>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Budget:</span>
                                  <span className="font-medium">{formatCurrency(dept.budget)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Actual:</span>
                                  <span className="font-medium">{formatCurrency(dept.actual)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Variance:</span>
                                  <span className={`font-medium ${
                                    dept.variance >= 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {formatCurrency(Math.abs(dept.variance))}
                                  </span>
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((dept.actual / dept.budget) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Combined Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-md font-medium text-gray-700 mb-4">Budget vs Actual Comparison</h4>
                          <div className="h-64 sm:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={processedData.revenueChartData} 
                                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="name" 
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                  interval={0}
                                />
                                <YAxis 
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="budget" fill="#3B82F6" name="Budget" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[2, 2, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <RevenueExpenseForecast CustomTooltip ={CustomTooltip} sessionId={userId} userName={userName} />
                {/* Summary Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data?.budget_vs_actual && (
                          <>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Revenue</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(processedData.budgetVsActual.revenue.budget)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(processedData.budgetVsActual.revenue.actual)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                                (processedData.budgetVsActual.revenue.budget - processedData.budgetVsActual.revenue.actual) <= 0 
                                  ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(processedData.budgetVsActual.revenue.budget - processedData.budgetVsActual.revenue.actual)}
                              </td>
                             
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Expenses</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(processedData.budgetVsActual.expense.budget)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(processedData.budgetVsActual.expense.actual)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                                processedData.budgetVsActual.expense.variance > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(processedData.budgetVsActual.expense.variance)}
                              </td>
                             
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;