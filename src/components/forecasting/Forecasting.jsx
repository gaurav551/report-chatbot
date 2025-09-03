import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { Brain, TrendingUp, TrendingDown, Zap, Target, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency'
export const predictionData = [
    // Historical data
    { year: '2020', revenue: 850000, expenses: 720000, confidence: 100, type: 'historical' },
    { year: '2021', revenue: 920000, expenses: 780000, confidence: 100, type: 'historical' },
    { year: '2022', revenue: 1150000, expenses: 950000, confidence: 100, type: 'historical' },
    { year: '2023', revenue: 1280000, expenses: 1080000, confidence: 100, type: 'historical' },
    { year: '2024', revenue: 1400000, expenses: 1200000, confidence: 95, type: 'current' },
    
    // Predictions - moderate scenario
    { 
      year: '2025', 
      revenue: 1600000,
      expenses: 1350000,
      revenueMin: 1480000, revenueMax: 1720000,
      expensesMin: 1300000, expensesMax: 1420000,
      confidence: 87, type: 'prediction' 
    },
    { 
      year: '2026', 
      revenue: 1770000,
      expenses: 1485000,
      revenueMin: 1580000, revenueMax: 1950000,
      expensesMin: 1420000, expensesMax: 1580000,
      confidence: 74, type: 'prediction' 
    },
    { 
      year: '2027', 
      revenue: 1965000,
      expenses: 1635000,
      revenueMin: 1680000, revenueMax: 2250000,
      expensesMin: 1550000, expensesMax: 1750000,
      confidence: 62, type: 'prediction' 
    },
    { 
      year: '2028', 
      revenue: 2180000,
      expenses: 1795000,
      revenueMin: 1780000, revenueMax: 2580000,
      expensesMin: 1680000, expensesMax: 1920000,
      confidence: 51, type: 'prediction' 
    }
  ];
export const Forecasting = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Prediction data with confidence intervals (moderate scenario)
  

  const insights = [
    { metric: 'Revenue Growth Rate', predicted: '12.8%', confidence: 87 },
    { metric: 'Market Expansion', predicted: 'Q3 2025', confidence: 73 },
    { metric: 'Cost Optimization', predicted: '$240K savings', confidence: 91 },
    { metric: 'Break-even Point', predicted: 'Month 14', confidence: 68 }
  ];

  

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const PredictionCard = ({ title, value, confidence, subtitle, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-blue-500">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Confidence</div>
          <div className="text-sm font-bold text-gray-900">{confidence}%</div>
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1 text-gray-900">{value}</h3>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-md">
          <p className="font-bold mb-2 text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
          {data.confidence && (
            <p className="text-xs text-gray-600 mt-2">Confidence: {data.confidence}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-10 w-10 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">
              Financial Forecasting
            </h1>
          </div>
          <p className="text-gray-600">Revenue and expense predictions </p>
        </div>

        {/* Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PredictionCard
            title="2025 Revenue Forecast"
            value={formatCurrency(predictionData.find(d => d.year === '2025')?.revenue)}
            confidence={87}
            subtitle="Based on 47 market indicators"
            icon={TrendingUp}
            trend={12.8}
          />
          <PredictionCard
            title="2025 Expense Forecast"
            value={formatCurrency(predictionData.find(d => d.year === '2025')?.expenses)}
            confidence={91}
            subtitle="Cost optimization detected"
            icon={Target}
            trend={-8.2}
          />
          <PredictionCard
            title="Profit Margin Trend"
            value="18.7%"
            confidence={74}
            subtitle="Improving efficiency"
            icon={TrendingUp}
            trend={5.3}
          />
          <PredictionCard
            title="Market Risk Level"
            value="Moderate"
            confidence={68}
            subtitle="External factors considered"
            icon={AlertTriangle}
          />
        </div>

        {/* Main Forecasting Chart */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              Revenue & Expense Forecast
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
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" />
                <YAxis tickFormatter={formatCurrency} stroke="#6b7280" />
                <Tooltip content={customTooltip} />
                
                {/* Main prediction lines */}
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="8 4"
                />
                
                {/* Reference line for current year */}
                <ReferenceLine x="2025" stroke="#9ca3af" strokeDasharray="2 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Key Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-700 text-sm">{insight.metric}</h3>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {insight.confidence}%
                  </span>
                </div>
                <p className="text-gray-900 font-bold text-lg">{insight.predicted}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
