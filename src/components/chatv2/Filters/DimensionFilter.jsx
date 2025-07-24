import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
  const userId = localStorage.getItem('user');
  const sessionId = localStorage.getItem('session_id');
// API function to fetch dimensions
const fetchDimensions = async () => {

  
  if (!userId || !sessionId) {
    throw new Error('User ID or Session ID not found in localStorage');
  }

  const response = await fetch(
    `https://agentic.aiweaver.ai/api/rpt2/dimensions?user_id=${userId}&session_id=${sessionId}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Modern Select Component for Dimension Filters
const ModernSelect = ({ label, value, onChange, options, multiple = false, single = false, placeholder = "Select...", loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options?.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelect = (optionValue) => {
    if (single) {
      onChange(optionValue);
      setIsOpen(false);
    } else if (multiple) {
      const newValue = Array.isArray(value) ? value : [];
      if (newValue.includes(optionValue)) {
        onChange(newValue.filter(v => v !== optionValue));
      } else {
        onChange([...newValue, optionValue]);
      }
    }
  };

  const handleSelectAll = () => {
    if (multiple && options) {
      onChange(options.map(opt => opt.code));
    }
  };

  const handleClearAll = () => {
    if (multiple) {
      onChange([]);
    }
  };

  const getDisplayValue = () => {
    if (loading) return "Loading...";
    
    if (single) {
      const selected = options?.find(opt => opt.code === value);
      return selected ? selected.label : placeholder;
    } else if (multiple) {
      const selectedCount = Array.isArray(value) ? value.length : 0;
      if (selectedCount === 0) return placeholder;
      if (selectedCount === 1) return options?.find(opt => opt.code === value[0])?.label || placeholder;
      return `${selectedCount} selected`;
    }
    return placeholder;
  };

  return (
    <div className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="block truncate flex items-center">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {getDisplayValue()}
          </span>
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {(multiple || (options && options.length > 5)) && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            {multiple && (
              <div className="p-2 border-b border-gray-200 flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            )}

            <div className="py-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.code}
                  onClick={() => handleSelect(option.code)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                    (single && value === option.code) || (multiple && Array.isArray(value) && value.includes(option.code))
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900'
                  }`}
                >
                  <span>{option.label}</span>
                  {multiple && Array.isArray(value) && value.includes(option.code) && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Dimension Field Filter
const DimensionFieldFilter = ({ field, filter, onFilterChange, options, loading }) => {
  const filterTypes = [
    { value: 'all', label: 'All' },
    { value: 'single', label: 'Single' },
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

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center space-x-4 mb-3">
        <h4 className="text-sm font-medium text-gray-700 capitalize w-20">{field}:</h4>
        <div className="flex space-x-2 flex-wrap">
          {filterTypes.map(type => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter.type === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {filter.type === 'contains' && (
        <input
          type="text"
          placeholder="Enter search term..."
          value={filter.containsValue}
          onChange={(e) => onFilterChange({ ...filter, containsValue: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {filter.type === 'range' && (
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="From..."
            value={filter.rangeFrom}
            onChange={(e) => onFilterChange({ ...filter, rangeFrom: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="To..."
            value={filter.rangeTo}
            onChange={(e) => onFilterChange({ ...filter, rangeTo: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {(filter.type === 'single' || filter.type === 'multiple') && (
        <ModernSelect
          value={filter.values}
          onChange={(values) => onFilterChange({ ...filter, values: Array.isArray(values) ? values : [values] })}
          options={options}
          multiple={filter.type === 'multiple'}
          single={filter.type === 'single'}
          placeholder={`Select ${field}...`}
          loading={loading}
        />
      )}
    </div>
  );
};

// Main Dimension Filter Component
const DimensionFilter = ({ filters, onFiltersChange, setDimensionFiltersQuery }) => {
  const dimensionFields = ['node', 'parent', 'dept', 'fund', 'account'];
  
  // Map field names to API response keys
  const fieldMapping = {
    'node': 'tree_node',
    'parent': 'parent_deptid',
    'dept': 'deptid',
    'fund': 'fund_code',
    'account': 'account'
  };

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

  const getOptionsForField = (field) => {
    if (!dimensionsData?.dimensions) return [];
    const apiField = fieldMapping[field];
    return dimensionsData.dimensions[apiField] || [];
  };

  const generateDimensionCriteria = () => {
    let criteria = '';
    Object.entries(filters).forEach(([field, filter]) => {
      if (filter.type === 'all') return;
      
      if (filter.type === 'single' && filter.values.length > 0) {
        criteria += ` and a.${field} = '${filter.values[0]}'`;
      } else if (filter.type === 'multiple' && filter.values.length > 0) {
        criteria += ` and a.${field} in (${filter.values.map(v => `'${v}'`).join(',')})`;
      } else if (filter.type === 'contains' && filter.containsValue) {
        criteria += ` and a.${field} like '%${filter.containsValue}%'`;
      } else if (filter.type === 'range' && filter.rangeFrom && filter.rangeTo) {
        criteria += ` and a.${field} between '${filter.rangeFrom}' and '${filter.rangeTo}'`;
      }
    });
    setDimensionFiltersQuery(criteria);
    return criteria;
  };

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
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
        Dimension Filters
      </h3>
      
      <div className="space-y-4 mb-6">
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

      {/* Preview of generated criteria */}
      {userId === 'admin' && 
      <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Dimension Criteria:</h4>
        <code className="text-sm text-gray-600 break-all">
         {generateDimensionCriteria() || 'No filters applied'}
        </code>
      </div>}
    </div>
  );
};

export default DimensionFilter;