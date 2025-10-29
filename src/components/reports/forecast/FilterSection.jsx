import React from 'react';
import MultiSelectDropdown from '../../ui/MultiSelectDropdown';

const staticOptions = {
  pastYears: [
    ['1', '1 Year'],
    ['2', '2 Years'],
    ['3', '3 Years'],
    ['4', '4 Years'],
    ['5', '5 Years']
  ],
  forecastMethods: [
    ['linear', 'Linear'],
    ['YoY', 'Year over Year'],
    ['mavg', '3 Months Moving Average']
  ]
};

export const FilterSection = ({ 
  filters, 
  onFiltersChange, 
  dimensions, 
  isDimensionsLoading,
  showForecastMethod = false 
}) => {
  const hasActiveFilters = 
    filters.fundCodes?.length > 0 || 
    filters.rollupDepartments?.length > 0 || 
    filters.departments?.length > 0 ||
    filters.accounts?.length > 0 ||
    filters.pastYears !== '' ||
    filters.forecastMethods.length > 0;

  const clearAllFilters = () => {
    const clearedFilters = {
      fundCodes: [],
      rollupDepartments: [],
      departments: [],
      accounts: [],
      pastYears: '',
      forecastMethods: []
    };
    onFiltersChange(clearedFilters);
  };

 const handleFilterChange = (filterKey, optionValue, isSelected) => {
    if (filterKey === 'pastYears') {
      const newFilters = { ...filters, pastYears: isSelected ? optionValue : '' };
      onFiltersChange(newFilters);
    } else {
      let updatedValues = [];
      const currentValues = filters[filterKey];
      const availableValues = dimensions[filterKey] || staticOptions[filterKey] || [];

      if (optionValue === 'ALL') {
        updatedValues = isSelected ? availableValues.map(([val]) => val) : [];
      } else {
        updatedValues = isSelected
          ? [...currentValues, optionValue]
          : currentValues.filter((v) => v !== optionValue);
      }

      const newFilters = { ...filters, [filterKey]: updatedValues };
      onFiltersChange(newFilters);
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          {showForecastMethod ? "Forecast by Methods" : "Analysis by Dimensions"}
        </h3>
       {!showForecastMethod && <button
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            hasActiveFilters
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          Clear All
        </button>}
      </div>
      
      {!showForecastMethod ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MultiSelectDropdown
              label="Fund Codes"
              value={filters.fundCodes}
              options={dimensions?.fundCodes || []}
              loading={isDimensionsLoading}
              placeholder="Select Fund Codes"
              onChange={(value, isSelected) => handleFilterChange('fundCodes', value, isSelected)}
              showSelectAll={true}
            />
            <MultiSelectDropdown
              label="Rollup Departments"
              value={filters.rollupDepartments}
              options={dimensions?.rollupDepartments || []}
              loading={isDimensionsLoading}
              placeholder="Select Rollup Departments"
              onChange={(value, isSelected) => handleFilterChange('rollupDepartments', value, isSelected)}
              showSelectAll={true}
            />
            <MultiSelectDropdown
              label="Departments"
              value={filters.departments}
              options={dimensions?.departments || []}
              loading={isDimensionsLoading}
              placeholder="Select Departments"
              onChange={(value, isSelected) => handleFilterChange('departments', value, isSelected)}
              showSelectAll={true}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MultiSelectDropdown
              label="Accounts"
              value={filters.accounts}
              options={dimensions?.accounts || []}
              loading={isDimensionsLoading}
              placeholder="Select Accounts"
              onChange={(value, isSelected) => handleFilterChange('accounts', value, isSelected)}
              showSelectAll={true}
            />
            <MultiSelectDropdown
              label="Past Years"
              value={filters.pastYears ? [filters.pastYears] : []}
              options={staticOptions.pastYears}
              placeholder="Select Past Years"
              onChange={(value, isSelected) => handleFilterChange('pastYears', value, isSelected)}
              singleSelect={true}
                              showDescription={false}

            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MultiSelectDropdown
            label="Forecast Method"
            value={filters.forecastMethods}
            options={staticOptions.forecastMethods}
            placeholder="Select Forecast Method"
            onChange={(value, isSelected) => handleFilterChange('forecastMethods', value, isSelected)}
            showSelectAll={true}
                            showDescription={false}

          />
        </div>
      )}
    </div>
  );
};