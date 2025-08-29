import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2, AlertCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ModernSelect from '../ui/ModernSelect';
// API function to fetch dimensions
const fetchDimensions = async () => {
  const userId = localStorage.getItem('user');
  const sessionId = localStorage.getItem('session_id');

  const response = await fetch(
    `https://agentic.aiweaver.ai/api/rpt2/dimensions?user_id=${userId}&session_id=${sessionId}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Individual Dimension Field Filter
const DimensionFieldFilter = ({ field, filter, onFilterChange, options, loading }) => {
  const filterTypes = [
    { value: 'multiple', label: 'Multiple' },
    { value: 'contains', label: 'Contains' },
    { value: 'range', label: 'Range' }
  ];

  const handleTypeChange = (newType) => {
    onFilterChange({
      ...filter,
      type: newType,
      values: [],
      containsValue: '',
      rangeFrom: '',
      rangeTo: ''
    });
  };

  // Check if range should be disabled for node field
  const isRangeDisabled = field === 'node';

  // Filter out the "All" option for range selects (no longer needed since we removed manual ALL)
  const getRangeOptions = () => {
    return options; // No need to filter since we're not adding manual "ALL" anymore
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <h4 className="text-sm font-medium text-gray-700 capitalize w-20">{field}:</h4>
          <div className="flex space-x-2 flex-wrap">
            {filterTypes.map(type => (
              <button
                key={type.value}
                onClick={() => !isRangeDisabled || type.value !== 'range' ? handleTypeChange(type.value) : null}
                disabled={isRangeDisabled && type.value === 'range'}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter.type === type.value
                    ? 'bg-blue-600 text-white'
                    : isRangeDisabled && type.value === 'range'
                    ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filter.type === 'contains' && (
        <input
          type="text"
          placeholder="Enter search term..."
          value={filter.containsValue || ''}
          onChange={(e) => onFilterChange({ ...filter, containsValue: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {filter.type === 'range' && (
        <div className="flex space-x-1.5">
          <div className="flex-1">
            <ModernSelect
              value={filter.rangeFrom || ''}
              onChange={(value) => onFilterChange({ ...filter, rangeFrom: value })}
              options={getRangeOptions()}
              single={true}
              placeholder="From..."
              loading={loading}
              showCodeLabel={true}
            />
          </div>
          <span className="text-gray-400 self-center text-sm">-</span>
          <div className="flex-1">
            <ModernSelect
              value={filter.rangeTo || ''}
              onChange={(value) => onFilterChange({ ...filter, rangeTo: value })}
              options={getRangeOptions()}
              single={true}
              placeholder="To..."
              loading={loading}
              showCodeLabel={true}
            />
          </div>
        </div>
      )}

      {filter.type === 'multiple' && (
        <ModernSelect
          value={filter.values || []}
          onChange={(value) => {
            onFilterChange({ 
              ...filter, 
              values: Array.isArray(value) ? value : (value ? [value] : [])
            });
          }}
          options={options}
          multiple={true}
          placeholder={`Select ${field}...`}
          loading={loading}
          showCodeLabel={true}
        />
      )}
    </div>
  );
};

// Main Dimension Filter Component
const DimensionFilter = ({ 
  filters, 
  onFiltersChange, 
  setDimensionFiltersExpQuery, 
  setDimensionFiltersRevQuery 
}) => {
  const dimensionFields = ['node', 'parent', 'dept', 'fund', 'account'];
  const userId = localStorage.getItem('user');
  const sessionId = localStorage.getItem('session_id');
  
  // Map field names to API response keys
  const fieldMapping = {
    'node': 'tree_node',
    'parent': 'parent_deptid',
    'dept': 'deptid',
    'fund': 'fund_code',
    'account': 'account'
  };

  // Define which fields are included in revenue and expense queries
  const revFields = ['parent', 'fund', 'account']; // Revenue fields
  const expFields = ['node', 'parent', 'dept', 'fund', 'account']; // Expense fields

  // Fetch dimensions data
  const { data: dimensionsData, isLoading, error } = useQuery({
    queryKey: ['dimensions'],
    queryFn: fetchDimensions,
  });

  const updateFilter = (field, filterData) => {
    onFiltersChange({
      ...filters,
      [field]: filterData
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    dimensionFields.forEach(field => {
      clearedFilters[field] = {
        type: 'all',
        values: [],
        containsValue: '',
        rangeFrom: '',
        rangeTo: ''
      };
    });
    onFiltersChange(clearedFilters);
    setDimensionFiltersExpQuery('');
    setDimensionFiltersRevQuery('');
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(filter => 
      filter && filter.type !== 'all' && (
        (filter.values && filter.values.length > 0) ||
        (filter.containsValue && filter.containsValue && filter.containsValue.trim() !== '') ||
        (filter.rangeFrom && filter.rangeFrom && filter.rangeFrom.trim() !== '') ||
        (filter.rangeTo && filter.rangeTo && filter.rangeTo.trim() !== '')
      )
    );
  };

  const getOptionsForField = (field) => {
    if (!dimensionsData?.dimensions) return [];
    const apiField = fieldMapping[field];
    const rawOptions = dimensionsData.dimensions[apiField] || [];
    
    // Transform the options to work with ModernSelect (expects 'code' and 'label' properties)
    // Don't add manual "ALL" option since ModernSelect handles "Select All" internally
    return rawOptions.map(option => ({
      code: option.code,
      label: option.label || option.name || option.description || option.code
    }));
  };

  const generateDimensionCriteria = (fieldsToInclude) => {
    let criteria = '';
    Object.entries(filters).forEach(([field, filter]) => {
      // Only include fields that are in the specified fieldsToInclude array
      if (!fieldsToInclude.includes(field)) return;
      
      // Use the mapped field names for SQL generation
      const mappedField = fieldMapping[field];
      
      if (filter.type === 'all') {
        criteria += ` and a.${mappedField} = 'all'`;
      } else if (filter.type === 'multiple' && filter.values && filter.values.length > 0) {
        // Get all available options for this field
        const availableOptions = getOptionsForField(field);
        
        // Check if all available options are selected (since ModernSelect handles "Select All" internally)
        // if (filter.values.length === availableOptions.length) {
        //   criteria += ` and a.${mappedField} = 'All'`;
        // } else {
          criteria += ` and a.${mappedField} in (${filter.values.map(v => `'${v}'`).join(',')})`;
       // }
      } else if (filter.type === 'contains' && filter.containsValue) {
        criteria += ` and a.${mappedField} like '%${filter.containsValue}%'`;
      } else if (filter.type === 'range' && filter.rangeFrom && filter.rangeTo) {
        criteria += ` and a.${mappedField} between '${filter.rangeFrom}' and '${filter.rangeTo}'`;
      }
    });
    return criteria;
  };

  const updateQueries = () => {
    // Generate separate queries for revenue and expense
    const revQuery = generateDimensionCriteria(revFields);
    const expQuery = generateDimensionCriteria(expFields);
    
    setDimensionFiltersRevQuery(revQuery);
    setDimensionFiltersExpQuery(expQuery);
  };

  // Update queries whenever filters change
  useEffect(() => {
    updateQueries();
  }, [filters]);

  // Check if user is admin
  const isAdmin = userId === 'admin';

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-600 text-center flex items-center justify-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <div>
            <p className="font-medium">Error loading dimension data</p>
            <p className="text-sm mt-1">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
          Filter by Dimensions 
        </h3>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>
      
      {/* 2-column grid layout for dimension fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {dimensionFields.map(field => (
          <DimensionFieldFilter
            key={field}
            field={field}
            filter={filters[field] || { type: 'all', values: [], containsValue: '', rangeFrom: '', rangeTo: '' }}
            onFilterChange={(filterData) => updateFilter(field, filterData)}
            options={getOptionsForField(field)}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Preview of generated criteria - only show for admin users */}
      {isAdmin && (
        <div className="mt-3 space-y-2">
          <div className="p-2 rounded-lg border border-green-200 bg-green-50">
            <div className="text-xs font-medium text-green-700 mb-1">Revenue Query (Parent, Fund, Account):</div>
            <code className="text-sm text-green-600 break-all">
              {generateDimensionCriteria(revFields) || 'No revenue filters applied'}
            </code>
          </div>
          <div className="p-2 rounded-lg border border-blue-200 bg-blue-50">
            <div className="text-xs font-medium text-blue-700 mb-1">Expense Query (Node, Parent, Dept, Fund, Account):</div>
            <code className="text-sm text-blue-600 break-all">
              {generateDimensionCriteria(expFields) || 'No expense filters applied'}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default DimensionFilter;