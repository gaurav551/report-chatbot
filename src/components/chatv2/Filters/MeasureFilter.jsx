import React, { useState, useMemo, useEffect } from 'react';
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
    `https://agentic.aiweaver.ai/api/rpt2/measures?user_id=${userId}&session_id=${sessionId}`
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
const MeasureFilter = ({ 
  filters, 
  onFiltersChange, 
  setMeasureFiltersExpQuery, 
  setMeasureFiltersRevQuery 
}) => {
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

  // Define specific measure mappings for revenue and expense based on actual API response
  const measureMappings = useMemo(() => {
    if (!measureStats?.measures) return { revenue: {}, expense: {} };
    
    console.log('Raw measureStats.measures:', measureStats.measures);
    
    // Define specific field mappings based on actual API field names and display names
    const revenueFields = {
      'total_budget_amt_rev': true,     // Budget (Rev)
      'total_rev_amt': true,            // Actuals(rev)
      'remaining_budget': true,         // Remaining Rev
      'pct_received': true              // %Received
    };
    
    const expenseFields = {
      'total_budget_amt_exp': true,     // Budget (Exp)
      'total_pre_encumbered_amt': true, // Pre-Encumbrance
      'total_encumbered_amt': true,     // Encumbrance
      'total_expenses': true,           // Actuals(exp)
      'total_exp_variance': true,       // Remaining Budget
      'pct_budget_spent': true          // %Spent
    };
    
    // Create mappings based on actual API response
    const revenue = {};
    const expense = {};
    
    Object.entries(measureStats.measures).forEach(([apiKey, measureData]) => {
      const displayName = measureData.display_name;
      
      console.log(`Processing field: ${apiKey}, displayName: ${displayName}`);
      
      // Check if this field is in revenue fields
      if (revenueFields[apiKey]) {
        revenue[apiKey] = displayName;
        console.log(`Added ${apiKey} (${displayName}) to revenue`);
      }
      
      // Check if this field is in expense fields
      if (expenseFields[apiKey]) {
        expense[apiKey] = displayName;
        console.log(`Added ${apiKey} (${displayName}) to expense`);
      }
    });
    
    console.log('Final mappings:', { revenue, expense });
    return { revenue, expense };
  }, [measureStats]);

  // Dynamically create measure fields from API response, filtered by our specific mappings
  const measureFields = useMemo(() => {
    if (!measureStats?.measures) return [];
    
    // Only include fields that are in either revenue or expense mappings
    const allMappedFields = new Set([
      ...Object.keys(measureMappings.revenue),
      ...Object.keys(measureMappings.expense)
    ]);
    
    return Object.entries(measureStats.measures)
      .filter(([apiKey]) => allMappedFields.has(apiKey))
      .map(([apiKey, measureData]) => ({
        key: apiKey,
        label: measureData.display_name,
        apiKey: apiKey,
        stats: {
          min: measureData.min,
          max: measureData.max,
          avg: measureData.avg,
          sum: measureData.sum
        }
      }));
  }, [measureStats, measureMappings]);

  const operators = [
    { value: '=', label: 'Equals (=)' },
    { value: '>', label: 'Between (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Between (>=)' },
    { value: '<=', label: 'Less than or equal (<=)' }
  ];

  const updateFilter = (field, filterData) => {
    const updatedFilters = {
      ...filters,
      [field]: filterData
    };
    onFiltersChange(updatedFilters);
    
    // Update queries immediately with the new filters
    updateQueries(updatedFilters);
  };

  // Update queries whenever filters change
  useEffect(() => {
    updateQueries(filters);
  }, [filters]);

  // Toggle field expansion
  const toggleFieldExpansion = (fieldKey) => {
    setExpandedFields(prev => ({
     
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Clear all filters function
  const clearAllFilters = () => {
    onFiltersChange({});
    setMeasureFiltersExpQuery('');
    setMeasureFiltersRevQuery('');
    setExpandedFields({});
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => 
      filters[key] && filters[key].operator && 
      (filters[key].value !== undefined || filters[key].range)
    );
  };

  // Generate measures criteria for revenue
  const generateRevenueMeasuresCriteria = (filtersToUse = filters) => {
    let criteria = '';
    Object.entries(filtersToUse).forEach(([field, filter]) => {
      if (filter.operator && (filter.value !== undefined || filter.range)) {
        // Check if this field is applicable to revenue using the specific mapping
        if (measureMappings.revenue[field]) {
          if (criteria) criteria += ' and ';
          
          // Map API field names to query field names
          let queryField = field;
          if (field === 'total_budget_amt_rev') {
            queryField = 'total_budget_amt';
          } else if (field === 'total_rev_amt') {
            queryField = 'total_rev_amt';
          } else if (field === 'remaining_budget') {
            queryField = 'remaining_budget';
          } else if (field === 'pct_received') {
            queryField = 'pct_received';
          }
          
          if (filter.operator === '>' || filter.operator === '>=') {
            if (filter.range) {
              const [start, end] = filter.range;
              criteria += `${queryField} ${filter.operator} ${(start)} and ${queryField} ${filter.operator === '>' ? '<' : '<='} ${(end)}`;
            }
          } else if (filter.value !== undefined) {
            criteria += `${queryField} ${filter.operator} ${(filter.value)}`;
          }
        }
      }
    });
    const result = criteria ? `where ${criteria}` : '';
    return result;
  };

  // Generate measures criteria for expense
  const generateExpenseMeasuresCriteria = (filtersToUse = filters) => {
    let criteria = '';
    console.log('=== EXPENSE CRITERIA GENERATION ===');
    console.log('Filters to use:', filtersToUse);
    console.log('Expense mappings:', measureMappings.expense);

    Object.entries(filtersToUse).forEach(([field, filter]) => {
      console.log(`Processing field: ${field}`, filter);
      
      // Check if filter has required properties
      if (!filter || !filter.operator) {
        console.log(`Skipping ${field} - no operator`);
        return;
      }
      
      if (filter.value === undefined && (!filter.range || !Array.isArray(filter.range))) {
        console.log(`Skipping ${field} - no value or range`);
        return;
      }
      
      // Check if this field is applicable to expense using the specific mapping
      if (!measureMappings.expense[field]) {
        console.log(`Skipping ${field} - not in expense mappings`);
        return;
      }
      
      console.log(`Processing ${field} for expense criteria`);
      
      if (criteria) criteria += ' and ';
      
      // Map API field names to query field names
      let queryField = field;
      if (field === 'total_budget_amt_exp') {
        queryField = 'total_budget_amt';
      } else if (field === 'total_pre_encumbered_amt') {
        queryField = 'total_pre_encumbered_amt';
      } else if (field === 'total_encumbered_amt') {
        queryField = 'total_encumbered_amt';
      } else if (field === 'total_expenses') {
        queryField = 'total_expenses';
      } else if (field === 'total_exp_variance') {
        queryField = 'total_exp_variance';
      } else if (field === 'pct_budget_spent') {
        queryField = 'pct_budget_spent';
      }
      
      if (filter.operator === '>' || filter.operator === '>=') {
        if (filter.range && Array.isArray(filter.range) && filter.range.length === 2) {
          const [start, end] = filter.range;
          criteria += `${queryField} ${filter.operator} ${(start)} and ${queryField} ${filter.operator === '>' ? '<' : '<='} ${(end)}`;
          console.log(`Added range criteria for ${field}: ${criteria}`);
        }
      } else if (filter.value !== undefined) {
        criteria += `${queryField} ${filter.operator} ${(filter.value)}`;
        console.log(`Added value criteria for ${field}: ${queryField} ${filter.operator} ${(filter.value)}`);
      }
    });
    
    const result = criteria ? `where ${criteria}` : '';
    console.log('Final expense criteria:', result);
    console.log('=== END EXPENSE CRITERIA GENERATION ===');
    return result;
  };

  // Generate both queries and set them
  const updateQueries = (updatedFilters) => {
    const revQuery = generateRevenueMeasuresCriteria(updatedFilters);
    const expQuery = generateExpenseMeasuresCriteria(updatedFilters);
    
    setMeasureFiltersRevQuery(revQuery);
    setMeasureFiltersExpQuery(expQuery);
    
    return { revQuery, expQuery };
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
        <div className="text-gray-600">No relevant measure data available for the specified fields</div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-[200px] bg-white rounded-lg shadow-lg">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center cursor-pointer">
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
      
      {/* Collapsible content - Changed from grid to flex layout */}
      <>
        <div className="columns-1 lg:columns-2 gap-4 space-y-4">
          {measureFields.map(field => {
            const stats = field.stats;
            const currentFilter = filters[field.key] || {};
            const isRangeOperator = currentFilter.operator === '>' || currentFilter.operator === '>=';
            const filterDisplay = formatFilterValue(currentFilter);
            const isExpanded = expandedFields[field.key];
            
            // Determine if this field applies to revenue, expense, or both
            const isRevenueField = measureMappings.revenue[field.key];
            const isExpenseField = measureMappings.expense[field.key];
            
            return (
              <div 
                key={field.key} 
                className="bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow break-inside-avoid mb-4"
              >
                {/* Field header - always visible */}
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleFieldExpansion(field.key)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-gray-800">
                        {field.label}
                      </h4>
                      {/* Show tags for which query this field affects */}
                      <div className="flex gap-1">
                       
                      </div>
                    </div>
                    
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
                              onChange={(newRange) => {
                                updateFilter(field.key, { ...currentFilter, range: newRange });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="bg-white rounded-md p-3 border border-gray-200">
                            <SingleSlider
                              min={stats.min}
                              max={stats.max}
                              value={currentFilter.value || stats.avg}
                              onChange={(newValue) => {
                                updateFilter(field.key, { ...currentFilter, value: newValue });
                              }}
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
          <div className="mt-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
            <div className="p-2 rounded-lg border border-green-200 bg-green-50">
              <div className="text-xs font-medium text-green-700 mb-1">Revenue Query:</div>
              <code className="text-sm text-green-600 break-all">
                {generateRevenueMeasuresCriteria(filters) || 'No revenue filters applied'}
              </code>
            </div>
            <div className="p-2 rounded-lg border border-red-200 bg-red-50">
              <div className="text-xs font-medium text-red-700 mb-1">Expense Query:</div>
              <code className="text-sm text-red-600 break-all">
                {generateExpenseMeasuresCriteria(filters) || 'No expense filters applied'}
              </code>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default MeasureFilter;