import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SingleSlider from '../../ui/SingleSlider';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import RangeSlider from '../../ui/RangeSlider';

// Utility function for value formatting
const formatValue = (val) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString();
};

// API function to fetch measure statistics
const fetchMeasureStats = async (userId, sessionId) => {
  const response = await axios.get(
    `https://agentic.aiweaver.ai/api/rpt2/measures?user_id=${'raja'}&session_id=${'a60a7299f9d5c3271a9acbbb99da9848'}`
  );
  return response.data;
};

// Format filter value for dropdown display
const formatFilterValue = (filter) => {
  if (!filter || !filter.operator) return '';
  
  const isRangeOperator = filter.operator === '>' || filter.operator === '>=';
  
  if (isRangeOperator && filter.range) {
    const [start, end] = filter.range;
    return `${formatValue(Math.round(start))} - ${formatValue(Math.round(end))}`;
  } else if (filter.value !== undefined) {
    return `${filter.operator} ${formatValue(Math.round(filter.value))}`;
  }
  
  return '';
};

// Main Measure Filter Component
const MeasureFilter = ({ filters, onFiltersChange, setMeasureFiltersQuery }) => {
  const [expandedFields, setExpandedFields] = useState({});

  // Get userId and sessionId from memory (localStorage replacement)
  const userId = localStorage.getItem('user');
  const sessionId = localStorage.getItem('session_id');

  // Fetch measure statistics using TanStack Query v5
  const { data: measureStats, isLoading, error } = useQuery({
    queryKey: ['measureStats', userId, sessionId],
    queryFn: () => fetchMeasureStats(userId, sessionId),
    enabled: !!(userId && sessionId),
  });

  // Dynamically create measure fields from API response
  const measureFields = useMemo(() => {
    if (!measureStats?.measures) return [];
    
    return Object.entries(measureStats.measures).map(([apiKey, measureData]) => ({
      key: apiKey, // Use the API key as the filter key
      label: measureData.display_name,
      apiKey: apiKey,
      stats: {
        min: measureData.min,
        max: measureData.max,
        avg: measureData.avg,
        sum: measureData.sum
      }
    }));
  }, [measureStats]);

  const operators = [
    { value: '=', label: 'Equals (=)' },
    { value: '>', label: 'Between (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Between (>=)' },
    { value: '<=', label: 'Less than or equal (<=)' }
  ];

  const updateFilter = (field, filterData) => {
    onFiltersChange({
      ...filters,
      [field]: filterData
    });
  };

  // Toggle field expansion
  const toggleFieldExpansion = (fieldKey) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Clear all filters function
  const clearAllFilters = () => {
    onFiltersChange({});
    setMeasureFiltersQuery('');
    setExpandedFields({})
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => 
      filters[key] && filters[key].operator && 
      (filters[key].value !== undefined || filters[key].range)
    );
  };



  const generateMeasuresCriteria = () => {
    let criteria = '';
    Object.entries(filters).forEach(([field, filter]) => {
      if (filter.operator && (filter.value !== undefined || filter.range)) {
        if (criteria) criteria += ' and ';
        
        if (filter.operator === '>' || filter.operator === '>=') {
          if (filter.range) {
            const [start, end] = filter.range;
            criteria += `${field} ${filter.operator} ${Math.round(start)} and ${field} ${filter.operator === '>' ? '<' : '<='} ${Math.round(end)}`;
          }
        } else if (filter.value !== undefined) {
          criteria += `${field} ${filter.operator} ${Math.round(filter.value)}`;
        }
      }
    });
    const result = criteria ? `where ${criteria}` : '';
    setMeasureFiltersQuery(result);
    return result || 'No filters applied';
  };

  // Check if user is admin
  const isAdmin = userId === 'admin';

  if (!userId || !sessionId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-600">Error: User ID or Session ID not found</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-gray-600">Loading measure statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-600">Error loading measure statistics: {error.message}</div>
      </div>
    );
  }

  // If no measure data is available, show appropriate message
  if (!measureFields.length) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-gray-600">No measure data available</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-gray-800 mr-2">
            Filter by Measures 
          </h3>
          
        </div>
        
        {/* Clear All Button */}
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
      
      {/* Collapsible content */}
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {measureFields.map(field => {
            const stats = field.stats;
            const currentFilter = filters[field.key] || {};
            const isRangeOperator = currentFilter.operator === '>' || currentFilter.operator === '>=';
            const filterDisplay = formatFilterValue(currentFilter);
            const isExpanded = expandedFields[field.key];
            
            return (
              <div key={field.key} className="bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                {/* Field header - always visible */}
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleFieldExpansion(field.key)}
                >
                  <div>
                    <h4 className="text-base font-semibold text-gray-800">
                      {field.label}
                    </h4>
                    
                    {/* Display selected filter value */}
                    {filterDisplay && (
                      <div className="text-sm text-blue-600 font-medium mt-1">
                        {filterDisplay}
                      </div>
                    )}
                  </div>
                  
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="mt-3">
                      <select
                        value={currentFilter.operator || ''}
                        onChange={(e) => {
                          const newOperator = e.target.value;
                          const newFilter = { ...currentFilter, operator: newOperator };
                          
                          if ((newOperator === '>' || newOperator === '>=') && !newFilter.range) {
                            newFilter.range = [stats.min, stats.max];
                            delete newFilter.value;
                          }
                          else if (newOperator && newOperator !== '>' && newOperator !== '>=' && newFilter.value === undefined) {
                            newFilter.value = stats.avg;
                            delete newFilter.range;
                          }
                          
                          updateFilter(field.key, newFilter);
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                      >
                        <option value="">Select Operator</option>
                        {operators.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                    </div>

                    {currentFilter.operator && (
                      <div className="mt-3">
                        {isRangeOperator ? (
                          <div className="bg-white rounded-md p-3 border border-gray-200">
                            <RangeSlider
                              min={stats.min}
                              max={stats.max}
                              value={currentFilter.range || [stats.min, stats.max]}
                              onChange={(newRange) => updateFilter(field.key, { ...currentFilter, range: newRange })}
                            />
                          </div>
                        ) : (
                          <div className="bg-white rounded-md p-3 border border-gray-200">
                            <SingleSlider
                              min={stats.min}
                              max={stats.max}
                              value={currentFilter.value || stats.avg}
                              onChange={(newValue) => updateFilter(field.key, { ...currentFilter, value: newValue })}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Statistics display */}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>Min: {stats.min.toLocaleString()}</span>
                      <span>•</span>
                      <span>Max: {stats.max.toLocaleString()}</span>
                      <span>•</span>
                      <span>Avg: {stats.avg.toLocaleString()}</span>
                      {stats.sum !== undefined && (
                        <>
                          <span>•</span>
                          <span>Sum: {stats.sum.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Preview section - only show for admin users */}
        {isAdmin && (
          <div className="mt-3 p-2 rounded-lg border border-gray-200 bg-gray-50">
            <code className="text-sm text-gray-600 break-all">
              {generateMeasuresCriteria()}
            </code>
          </div>
        )}
      </>
    </div>
  );
};

export default MeasureFilter;