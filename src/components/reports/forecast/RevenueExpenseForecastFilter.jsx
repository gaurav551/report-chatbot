import React, { useState, useEffect } from 'react';
import MultiSelectDropdown from '../../ui/MultiSelectDropdown';

const API_BASE_URL = 'https://agentic.aiweaver.ai/api';

export const RevenueExpenseForecastFilter = ({ onFiltersChange, initialFilters = { fundCodes: [], departments: [], accounts: [] } }) => {
  const [filters, setFilters] = useState(initialFilters);

  const [availableOptions, setAvailableOptions] = useState({
    fundCodes: [],
    departments: [],
    accounts: [],
  });

  const [loading, setLoading] = useState({
    dimensions: false,
  });

  // Fetch all dimensions from the new API
  useEffect(() => {
    const loadDimensions = async () => {
      try {
        setLoading((prev) => ({ ...prev, dimensions: true }));
        
        // Get user and session_id from localStorage
        const userId = localStorage.getItem('user') || 'Raj';
        const sessionId = localStorage.getItem('session_id') || '922a20f5f7d64a2344ebc4cda95ef0f4';
        
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
        
        setAvailableOptions({
          fundCodes: data.dimensions?.fund_code ? formatDimension(data.dimensions.fund_code) : [],
          departments: data.dimensions?.parent_deptid ? formatDimension(data.dimensions.parent_deptid) : [],
          accounts: data.dimensions?.account ? formatDimension(data.dimensions.account) : [],
        });
        
      } catch (err) {
        console.error('Error loading dimensions:', err);
        // Set empty arrays as fallback
        setAvailableOptions({
          fundCodes: [],
          departments: [],
          accounts: [],
        });
      } finally {
        setLoading((prev) => ({ ...prev, dimensions: false }));
      }
    };

    loadDimensions();
  }, []);

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Handle fund code changes
  const handleFundCodeChange = (code, isSelected) => {
    let updatedCodes = [];

    if (code === 'ALL') {
      updatedCodes = isSelected ? availableOptions.fundCodes.map(([val]) => val) : [];
    } else {
      updatedCodes = isSelected
        ? [...filters.fundCodes, code]
        : filters.fundCodes.filter((c) => c !== code);
    }

    setFilters((prev) => ({ 
      ...prev, 
      fundCodes: updatedCodes
    }));
  };

  // Handle department changes
  const handleDepartmentChange = (dept, isSelected) => {
    let updatedDepts = [];

    if (dept === 'ALL') {
      updatedDepts = isSelected ? availableOptions.departments.map(([val]) => val) : [];
    } else {
      updatedDepts = isSelected
        ? [...filters.departments, dept]
        : filters.departments.filter((d) => d !== dept);
    }

    setFilters((prev) => ({ ...prev, departments: updatedDepts }));
  };

  // Handle account changes
  const handleAccountChange = (account, isSelected) => {
    let updatedAccounts = [];

    if (account === 'ALL') {
      updatedAccounts = isSelected ? availableOptions.accounts.map(([val]) => val) : [];
    } else {
      updatedAccounts = isSelected
        ? [...filters.accounts, account]
        : filters.accounts.filter((a) => a !== account);
    }

    setFilters((prev) => ({ ...prev, accounts: updatedAccounts }));
  };

  const isLoading = loading.dimensions;

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Departments Filter */}
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
      </div>
    </div>
  );
};