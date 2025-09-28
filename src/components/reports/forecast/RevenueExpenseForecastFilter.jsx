import React, { useState, useEffect } from 'react';
import MultiSelectDropdown from '../../ui/MultiSelectDropdown';

const API_BASE_URL = 'https://agentic.aiweaver.ai/api';

export const RevenueExpenseForecastFilter = ({ 
  onFiltersChange, 
  initialFilters = { 
    fundCodes: [], 
    rollupDepartments: [], 
    departments: [],
    accounts: [],
    pastYears: [],
    forecastMethods: []
  } 
}) => {
  const [filters, setFilters] = useState(initialFilters);

  const [availableOptions, setAvailableOptions] = useState({
    fundCodes: [],
    rollupDepartments: [],
    departments: [],
    accounts: [],
    pastYears: [
      ['all', 'All Years'],
      ['1', '1 Year'],
      ['2', '2 Years'],
      ['3', '3 Years'],
      ['4', '4 Years'],
      ['5', '5 Years']
    ],
    forecastMethods: [
      ['all', 'All Methods'],
      ['linear', 'Linear'],
      ['YoY', 'Year over Year'],
      ['3monthAvg', '3 Month Average']
    ]
  });

  const [loading, setLoading] = useState({
    dimensions: false,
  });

  // Clear data function
  const clearAllData = () => {
    setFilters(initialFilters);
    setAvailableOptions({
      fundCodes: [],
      rollupDepartments: [],
      departments: [],
      accounts: [],
      pastYears: [
        ['all', 'All Years'],
        ['1', '1 Year'],
        ['2', '2 Years'],
        ['3', '3 Years'],
        ['4', '4 Years'],
        ['5', '5 Years']
      ],
      forecastMethods: [
        ['all', 'All Methods'],
        ['linear', 'Linear'],
        ['YoY', 'Year over Year'],
        ['3monthAvg', '3 Month Average']
      ]
    });
    setLoading({
      dimensions: false,
    });
  };

  // Clear all filters function
  const clearAllFilters = () => {
    const clearedFilters = { 
      fundCodes: [], 
      rollupDepartments: [], 
      departments: [],
      accounts: [],
      pastYears: [],
      forecastMethods: []
    };
    setFilters(clearedFilters);
  };

  // Check if any filters are selected
  const hasActiveFilters = filters.fundCodes.length > 0 || 
                          filters.rollupDepartments?.length > 0 || 
                          filters.departments.length > 0 ||
                          filters.accounts.length > 0 ||
                          filters.pastYears?.length > 0 ||
                          filters.forecastMethods?.length > 0;

  // Fetch all dimensions from the API
  const loadDimensions = async () => {
    try {
      setLoading((prev) => ({ ...prev, dimensions: true }));
      
      // Get user and session_id from localStorage
      const userId = localStorage.getItem('user');
      const sessionId = localStorage.getItem('session_id');
      
      const url = `${API_BASE_URL}/rpt2/forecast-dimensions?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(sessionId)}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
      const data = await res.json();
      
      // Extract the required dimensions and format them for MultiSelectDropdown
      const formatDimension = (dimensionArray) => {
        return dimensionArray.map(item => [item.code, item.label || item.code]);
      };
      
      setAvailableOptions(prev => ({
        ...prev,
        fundCodes: data.dimensions?.fund_code ? formatDimension(data.dimensions.fund_code) : [],
        rollupDepartments: data.dimensions?.parent_deptid ? formatDimension(data.dimensions.parent_deptid) : [],
        departments: data.dimensions?.deptid ? formatDimension(data.dimensions.deptid) : [],
        accounts: data.dimensions?.account ? formatDimension(data.dimensions.account) : [],
      }));
      
    } catch (err) {
      console.error('Error loading dimensions:', err);
      // Set empty arrays as fallback (keeping static options)
      setAvailableOptions(prev => ({
        ...prev,
        fundCodes: [],
        rollupDepartments: [],
        departments: [],
        accounts: [],
      }));
    } finally {
      setLoading((prev) => ({ ...prev, dimensions: false }));
    }
  };

  // Initial load of dimensions
  useEffect(() => {
    loadDimensions();
  }, []);

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Generic handler for filter changes
  const handleFilterChange = (filterKey, optionValue, isSelected) => {
    setFilters((prev) => {
      let updatedValues = [];
      const currentValues = prev[filterKey];
      const availableValues = availableOptions[filterKey];

      if (optionValue === 'ALL') {
        updatedValues = isSelected ? availableValues.map(([val]) => val) : [];
      } else {
        updatedValues = isSelected
          ? [...currentValues, optionValue]
          : currentValues.filter((v) => v !== optionValue);
      }

      return {
        ...prev,
        [filterKey]: updatedValues
      };
    });
  };

  // Individual handler functions
  const handleFundCodeChange = (code, isSelected) => {
    handleFilterChange('fundCodes', code, isSelected);
  };

  const handleRollupDepartmentChange = (dept, isSelected) => {
    handleFilterChange('rollupDepartments', dept, isSelected);
  };

  const handleDepartmentChange = (dept, isSelected) => {
    handleFilterChange('departments', dept, isSelected);
  };

  const handleAccountChange = (account, isSelected) => {
    handleFilterChange('accounts', account, isSelected);
  };

  const handlePastYearsChange = (years, isSelected) => {
    handleFilterChange('pastYears', years, isSelected);
  };

  const handleForecastMethodChange = (method, isSelected) => {
    handleFilterChange('forecastMethods', method, isSelected);
  };

  const isLoading = loading.dimensions;

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Analysis by Dimensions</h3>
        <button
          onClick={clearAllFilters}
          disabled={!hasActiveFilters || isLoading}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
            hasActiveFilters && !isLoading
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-800'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          Clear All
        </button>
      </div>
      
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Fund Codes Filter */}
        <div>
          <MultiSelectDropdown
            label="Fund Codes"
            value={filters.fundCodes}
            options={availableOptions.fundCodes}
            loading={isLoading}
            disabled={isLoading}
            placeholder={isLoading ? "Loading..." : "Select Fund Codes"}
            onChange={handleFundCodeChange}
            showSelectAll={true}
          />
        </div>

        {/* Rollup Departments Filter (formerly Departments) */}
        <div>
          <MultiSelectDropdown
            label="Rollup Departments"
            value={filters.rollupDepartments}
            options={availableOptions.rollupDepartments}
            loading={isLoading}
            disabled={isLoading}
            placeholder={isLoading ? "Loading..." : "Select Rollup Departments"}
            onChange={handleRollupDepartmentChange}
            showSelectAll={true}
          />
        </div>

        {/* Departments Filter (new - child departments) */}
        <div>
          <MultiSelectDropdown
            label="Departments"
            value={filters.departments}
            options={availableOptions.departments}
            loading={isLoading}
            disabled={isLoading}
            placeholder={isLoading ? "Loading..." : "Select Departments"}
            onChange={handleDepartmentChange}
            showSelectAll={true}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Accounts Filter */}
        <div>
          <MultiSelectDropdown
            label="Accounts"
            value={filters.accounts}
            options={availableOptions.accounts}
            loading={isLoading}
            disabled={isLoading}
            placeholder={isLoading ? "Loading..." : "Select Accounts"}
            onChange={handleAccountChange}
            showSelectAll={true}
          />
        </div>

        {/* Past Years Filter */}
        <div>
          <MultiSelectDropdown
            label="Past Years"
            value={filters.pastYears}
            options={availableOptions.pastYears}
            loading={false}
            disabled={false}
            placeholder="Select Past Years"
            onChange={handlePastYearsChange}
            showSelectAll={true}
          />
        </div>

        {/* Forecast Method Filter */}
        <div>
          <MultiSelectDropdown
            label="Forecast Method"
            value={filters.forecastMethods}
            options={availableOptions.forecastMethods}
            loading={false}
            disabled={false}
            placeholder="Select Forecast Method"
            onChange={handleForecastMethodChange}
            showSelectAll={true}
          />
        </div>
      </div>
    </div>
  );
};