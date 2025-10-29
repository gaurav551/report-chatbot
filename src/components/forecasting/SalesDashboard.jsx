import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, DollarSign, ShoppingCart, Star, Filter, ChevronDown, ChevronUp, Download, Calendar, X, Check, Search } from 'lucide-react';

const fetchSalesData = async () => {
  const response = await fetch('https://agentic.aiweaver.ai/api/analytics/sales/records?partner_id=1001&limit=500');
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

const MultiSelectDropdown = ({
  label,
  value = [],
  options = [],
  loading = false,
  disabled = false,
  placeholder = 'Select options',
  onChange,
  color = 'blue',
  showSelectAll = false,
  singleSelect = false,
  showDescription = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  const colorVariants = {
    blue: {
      border: 'border-blue-300 focus-within:border-blue-500',
      ring: 'focus-within:ring-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
      tag: 'bg-blue-100 text-blue-800',
      checkbox: 'text-blue-600'
    },
    green: {
      border: 'border-green-300 focus-within:border-green-500',
      ring: 'focus-within:ring-green-500',
      button: 'bg-green-500 hover:bg-green-600',
      tag: 'bg-green-100 text-green-800',
      checkbox: 'text-green-600'
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  const filteredOptions = options.filter(([val, label]) =>
    `${val} - ${label}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionToggle = (optionVal) => {
    if (singleSelect) {
      const isSelected = value.includes(optionVal);
      if (!isSelected) {
        onChange?.(optionVal, true);
        setIsOpen(false);
      } else {
        onChange?.(optionVal, false);
      }
    } else {
      const isSelected = value.includes(optionVal);
      onChange?.(optionVal, !isSelected);
    }
  };

  const handleSelectAll = () => {
    if (singleSelect) return;
    const allSelected = filteredOptions.every(([val]) => value.includes(val));
    onChange?.('ALL', !allSelected);
  };

  const removeTag = (val) => {
    onChange?.(val, false);
  };

  const clearAll = () => {
    if (singleSelect) {
      if (value.length > 0) {
        onChange?.(value[0], false);
      }
    } else {
      value.forEach((v) => onChange?.(v, false));
    }
  };

  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every(([val]) => value.includes(val));
  const someFilteredSelected = filteredOptions.some(([val]) => value.includes(val));

  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder;
    }
    if (singleSelect && value.length > 0) {
      const selectedOption = options.find(([val]) => val === value[0]);
      if (!showDescription) {
        return selectedOption ? `${label} Selected - ${selectedOption[1]}` : value[0];
      }
      return selectedOption ? `${selectedOption[0]} - ${selectedOption[1]}` : value[0];
    }
    return `${value.length} ${label} selected`;
  };

  return (
    <div className="w-full">
      <div className="relative" ref={dropdownRef}>
        <div
          className={`
            relative w-full min-h-[2.5rem] px-3 py-2 border rounded-md shadow-sm
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'}
            ${colors.border} ${colors.ring}
            focus-within:ring-1 focus-within:ring-opacity-50
            transition-colors duration-200
          `}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${value.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                {getDisplayText()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
              )}
              {value.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>

        {isOpen && !disabled && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {showSelectAll && !singleSelect && filteredOptions.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={handleSelectAll}>
                  <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 ${
                    allFilteredSelected ? `${colors.button} border-transparent` :
                    someFilteredSelected ? `${colors.button} border-transparent opacity-50` : 'border-gray-300'
                  }`}>
                    {(allFilteredSelected || someFilteredSelected) && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Select All {searchTerm && `(${filteredOptions.length})`}
                  </span>
                </div>
              </div>
            )}

            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map(([val, label], index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOptionToggle(val)}
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 ${
                      value.includes(val) ? `${colors.button} border-transparent` : 'border-gray-300'
                    }`}>
                      {value.includes(val) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-900">{showDescription ? `${val} - ${label}` : label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {value.length > 0 && !singleSelect && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 4).map((val, index) => {
              const option = options.find(([code]) => code === val);
              const displayLabel = option ? `${option[0]} - ${option[1]}` : val;
              return (
                <div key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.tag}`}>
                  <span className="mr-1">{displayLabel}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeTag(val)}
                      className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            {value.length > 4 && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.tag}`}>
                <span>+{value.length - 4} others</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SalesDashboard = () => {
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['salesData'],
    queryFn: fetchSalesData
  });

  const [filters, setFilters] = useState({
    categories: [],
    subCategories: [],
    regions: [],
    customers: [],
    salesPeople: [],
    startDate: '',
    endDate: ''
  });

  const [timeGranularity, setTimeGranularity] = useState('Monthly');
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    subCategory: false,
    region: true,
    dateRange: true,
    customer: false,
    salesPerson: false
  });

  const processedData = useMemo(() => {
    if (!salesData) return null;

    let filtered = salesData.map(item => ({
      ...item,
      orderDate: new Date(item.order_date),
      profit: item.sales * 0.2,
      satisfaction: Math.max(1, Math.min(5, 4 + (Math.random() - 0.5)))
    }));

    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => filters.categories.includes(item.category));
    }
    if (filters.subCategories.length > 0) {
      filtered = filtered.filter(item => filters.subCategories.includes(item.sub_category));
    }
    if (filters.regions.length > 0) {
      filtered = filtered.filter(item => filters.regions.includes(item.region));
    }
    if (filters.customers.length > 0) {
      filtered = filtered.filter(item => filters.customers.includes(item.customer_name));
    }
    if (filters.salesPeople.length > 0) {
      filtered = filtered.filter(item => filters.salesPeople.includes(item.sales_person || 'Unknown'));
    }
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(item => item.orderDate >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => item.orderDate <= endDate);
    }

    return filtered;
  }, [salesData, filters]);

  const filterOptions = useMemo(() => {
    if (!salesData) return {};
    
    const customers = [...new Set(salesData.map(item => item.customer_name))].sort();
    const salesPeople = [...new Set(salesData.map(item => item.sales_person || 'Unknown'))].sort();
    
    return {
      categories: [...new Set(salesData.map(item => item.category))].sort(),
      subCategories: [...new Set(salesData.map(item => item.sub_category))].sort(),
      regions: [...new Set(salesData.map(item => item.region))].sort(),
      customers: customers.map(c => [c, c]),
      salesPeople: salesPeople.map(s => [s, s])
    };
  }, [salesData]);

  const kpis = useMemo(() => {
    if (!processedData) return null;
    const totalSales = processedData.reduce((sum, item) => sum + item.sales, 0);
    const totalProfit = processedData.reduce((sum, item) => sum + item.profit, 0);
    const avgSatisfaction = processedData.reduce((sum, item) => sum + item.satisfaction, 0) / processedData.length;
    return {
      totalSales,
      totalProfit,
      avgSatisfaction,
      avgOrderValue: totalSales / processedData.length,
      orderCount: processedData.length
    };
  }, [processedData]);

  const downloadCSV = () => {
    if (!processedData) return;

    const headers = ['Order Date', 'Customer Name', 'Sales Person', 'Category', 'Sub Category', 'Region', 'State', 'Segment', 'Ship Mode', 'Sales', 'Profit', 'Satisfaction'];
    const rows = processedData.map(item => [
      item.order_date,
      item.customer_name,
      item.sales_person || 'Unknown',
      item.category,
      item.sub_category,
      item.region,
      item.state,
      item.segment,
      item.ship_mode,
      item.sales.toFixed(2),
      item.profit.toFixed(2),
      item.satisfaction.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeSeriesOption = useMemo(() => {
    if (!processedData) return {};
    
    const grouped = {};
    processedData.forEach(item => {
      const date = item.orderDate;
      let key;
      
      switch(timeGranularity) {
        case 'Daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'Weekly':
          const week = new Date(date);
          week.setDate(date.getDate() - date.getDay() + 1);
          key = week.toISOString().split('T')[0];
          break;
        case 'Monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'Quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += item.sales;
    });

    const data = Object.entries(grouped).sort().map(([date, sales]) => ({ date, sales }));

    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map(d => d.date) },
      yAxis: { type: 'value', name: 'Sales ($)' },
      series: [{ data: data.map(d => d.sales), type: 'line', smooth: true, itemStyle: { color: '#2563eb' } }]
    };
  }, [processedData, timeGranularity]);

  const categoryOption = useMemo(() => {
    if (!processedData) return {};
    const grouped = {};
    processedData.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = 0;
      grouped[item.category] += item.sales;
    });
    const data = Object.entries(grouped).map(([category, sales]) => ({ category, sales })).sort((a, b) => b.sales - a.sales);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: data.map(d => d.category) },
      yAxis: { type: 'value', name: 'Sales ($)' },
      series: [{ data: data.map(d => d.sales), type: 'bar', itemStyle: { color: '#3b82f6' } }]
    };
  }, [processedData]);

  const regionOption = useMemo(() => {
    if (!processedData) return {};
    const grouped = {};
    processedData.forEach(item => {
      if (!grouped[item.region]) grouped[item.region] = 0;
      grouped[item.region] += item.sales;
    });
    const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: data,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    };
  }, [processedData]);

  const subCategoryOption = useMemo(() => {
    if (!processedData) return {};
    const grouped = {};
    processedData.forEach(item => {
      if (!grouped[item.sub_category]) grouped[item.sub_category] = 0;
      grouped[item.sub_category] += item.sales;
    });
    const data = Object.entries(grouped)
      .map(([subCategory, sales]) => ({ subCategory, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', name: 'Sales ($)' },
      yAxis: { type: 'category', data: data.map(d => d.subCategory).reverse() },
      series: [{ data: data.map(d => d.sales).reverse(), type: 'bar', itemStyle: { color: '#10b981' } }]
    };
  }, [processedData]);

  const segmentOption = useMemo(() => {
    if (!processedData) return {};
    const grouped = {};
    processedData.forEach(item => {
      if (!grouped[item.segment]) grouped[item.segment] = 0;
      grouped[item.segment] += item.sales;
    });
    const data = Object.entries(grouped).map(([segment, sales]) => ({ segment, sales }));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: data.map(d => d.segment) },
      yAxis: { type: 'value', name: 'Sales ($)' },
      series: [{ data: data.map(d => d.sales), type: 'bar', itemStyle: { color: '#8b5cf6' } }]
    };
  }, [processedData]);

  const customerOption = useMemo(() => {
    if (!processedData) return {};
    const grouped = {};
    processedData.forEach(item => {
      if (!grouped[item.customer_name]) grouped[item.customer_name] = 0;
      grouped[item.customer_name] += item.sales;
    });
    const data = Object.entries(grouped)
      .map(([customer, sales]) => ({ customer, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', name: 'Sales ($)' },
      yAxis: { type: 'category', data: data.map(d => d.customer).reverse() },
      series: [{ data: data.map(d => d.sales).reverse(), type: 'bar', itemStyle: { color: '#f59e0b' } }]
    };
  }, [processedData]);

  const shipModeOption = useMemo(() => {
    if (!processedData) return {};
    const grouped = {};
    processedData.forEach(item => {
      if (!grouped[item.ship_mode]) grouped[item.ship_mode] = 0;
      grouped[item.ship_mode] += item.sales;
    });
    const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [{ type: 'pie', radius: ['30%', '60%'], data: data }]
    };
  }, [processedData]);

  const weekdayOption = useMemo(() => {
    if (!processedData) return {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    processedData.forEach(item => {
      const day = days[item.orderDate.getDay()];
      if (!grouped[day]) grouped[day] = 0;
      grouped[day] += item.sales;
    });
    const data = days.map(day => grouped[day] || 0);
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: days },
      yAxis: { type: 'value', name: 'Sales ($)' },
      series: [{ data: data, type: 'line', smooth: true, itemStyle: { color: '#10b981' } }]
    };
  }, [processedData]);

  const stateOption = useMemo(() => {
    if (!processedData) return {};
    const grouped = {};
    processedData.forEach(item => {
      if (!grouped[item.state]) grouped[item.state] = 0;
      grouped[item.state] += item.sales;
    });
    const data = Object.entries(grouped)
      .map(([state, sales]) => ({ state, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', name: 'Sales ($)' },
      yAxis: { type: 'category', data: data.map(d => d.state).reverse() },
      series: [{ data: data.map(d => d.sales).reverse(), type: 'bar', itemStyle: { color: '#ef4444' } }]
    };
  }, [processedData]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleMultiSelectChange = (filterType) => (value, isSelected) => {
    if (value === 'ALL') {
      if (isSelected) {
        setFilters(prev => ({
          ...prev,
          [filterType]: filterOptions[filterType].map(([val]) => val)
        }));
      } else {
        setFilters(prev => ({ ...prev, [filterType]: [] }));
      }
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: isSelected
          ? [...prev[filterType], value]
          : prev[filterType].filter(v => v !== value)
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-lg overflow-y-auto z-50 border-r border-gray-200">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
          </div>

          {/* Date Range Filter */}
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedFilters(prev => ({ ...prev, dateRange: !prev.dateRange }))}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </span>
              {expandedFilters.dateRange ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedFilters.dateRange && (
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedFilters(prev => ({ ...prev, category: !prev.category }))}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-semibold text-sm text-gray-700">Category</span>
              {expandedFilters.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedFilters.category && (
              <div className="p-3 space-y-1 max-h-40 overflow-y-auto">
                {filterOptions.categories?.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat) || filters.categories.length === 0}
                      onChange={() => handleFilterChange('categories', cat)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sub-Category Filter */}
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedFilters(prev => ({ ...prev, subCategory: !prev.subCategory }))}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-semibold text-sm text-gray-700">Sub-Category</span>
              {expandedFilters.subCategory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedFilters.subCategory && (
              <div className="p-3 space-y-1 max-h-40 overflow-y-auto">
                {filterOptions.subCategories?.map(subCat => (
                  <label key={subCat} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.subCategories.includes(subCat) || filters.subCategories.length === 0}
                      onChange={() => handleFilterChange('subCategories', subCat)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{subCat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Region Filter */}
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedFilters(prev => ({ ...prev, region: !prev.region }))}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-semibold text-sm text-gray-700">Region</span>
              {expandedFilters.region ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedFilters.region && (
              <div className="p-3 space-y-1">
                {filterOptions.regions?.map(region => (
                  <label key={region} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.regions.includes(region) || filters.regions.length === 0}
                      onChange={() => handleFilterChange('regions', region)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{region}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Customer Filter */}
          <div className="mb-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFilters(prev => ({ ...prev, customer: !prev.customer }))}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-semibold text-sm text-gray-700">Customers</span>
                {expandedFilters.customer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            {expandedFilters.customer && (
              <div className="mt-2">
                <MultiSelectDropdown
                  label="Customers"
                  value={filters.customers}
                  options={filterOptions.customers || []}
                  placeholder="Select customers"
                  onChange={handleMultiSelectChange('customers')}
                  color="blue"
                  showSelectAll={true}
                  showDescription={false}
                />
              </div>
            )}
          </div>

          {/* Sales Person Filter */}
          <div className="mb-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFilters(prev => ({ ...prev, salesPerson: !prev.salesPerson }))}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-semibold text-sm text-gray-700">Sales Person</span>
                {expandedFilters.salesPerson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            {expandedFilters.salesPerson && (
              <div className="mt-2">
                <MultiSelectDropdown
                  label="Sales People"
                  value={filters.salesPeople}
                  options={filterOptions.salesPeople || []}
                  placeholder="Select sales people"
                  onChange={handleMultiSelectChange('salesPeople')}
                  color="green"
                  showSelectAll={true}
                  showDescription={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            Sales Analytics Dashboard
          </h1>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Download CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Sales</span>
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">${kpis?.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-gray-500">{kpis?.orderCount} orders</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Avg Order Value</span>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">${kpis?.avgOrderValue.toFixed(2)}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Profit</span>
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">${kpis?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Avg Satisfaction</span>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{kpis?.avgSatisfaction.toFixed(2)} ⭐</div>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Sales Trends Over Time</h2>
          <div className="flex gap-2 mb-4">
            {['Daily', 'Weekly', 'Monthly', 'Quarterly'].map(gran => (
              <button
                key={gran}
                onClick={() => setTimeGranularity(gran)}
                className={`px-3 py-1 rounded text-sm font-medium ${timeGranularity === gran ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {gran}
              </button>
            ))}
          </div>
          <ReactECharts option={timeSeriesOption} style={{ height: '300px' }} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Sales by Category</h2>
            <ReactECharts option={categoryOption} style={{ height: '300px' }} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Sales by Region</h2>
            <ReactECharts option={regionOption} style={{ height: '300px' }} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Top 10 Sub-Categories</h2>
            <ReactECharts option={subCategoryOption} style={{ height: '300px' }} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Sales by Segment</h2>
            <ReactECharts option={segmentOption} style={{ height: '300px' }} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Top 10 Customers</h2>
            <ReactECharts option={customerOption} style={{ height: '300px' }} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Sales by Ship Mode</h2>
            <ReactECharts option={shipModeOption} style={{ height: '300px' }} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Sales by Day of Week</h2>
            <ReactECharts option={weekdayOption} style={{ height: '300px' }} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Top 10 States</h2>
            <ReactECharts option={stateOption} style={{ height: '300px' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 py-4 border-t border-gray-200">
          <p>Total Records: {salesData?.length.toLocaleString()} | Filtered Records: {processedData?.length.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;