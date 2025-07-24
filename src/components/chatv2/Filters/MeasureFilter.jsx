import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// API function to fetch measure statistics
const fetchMeasureStats = async (userId, sessionId) => {
  const response = await axios.get(
    `https://agentic.aiweaver.ai/api/rpt2/measures?user_id=${userId}&session_id=${sessionId}`
  );
  return response.data;
};

// Main Measure Filter Component
const MeasureFilter = ({ filters, onFiltersChange, measureFiltersQuery, setMeasureFiltersQuery }) => {
  // Get userId and sessionId from localStorage
  const userId = localStorage.getItem('user');
  const sessionId = localStorage.getItem('session_id');

  // Fetch measure statistics using TanStack Query v5
  const { data: measureStats, isLoading, error } = useQuery({
    queryKey: ['measureStats', userId, sessionId],
    queryFn: () => fetchMeasureStats(userId, sessionId),
    enabled: !!(userId && sessionId), // Only run query if both values exist
   
  });

const measureFields = [
    // Revenue measures
    { key: 'total_budget_amt', label: 'Budget', apiKey: 'total_budget_amt' },
    { key: 'total_rev_amt', label: 'Actuals', apiKey: 'total_rev_amt' },
    { key: 'remaining_budget', label: 'Remaining Budget', apiKey: 'remaining_budget' },
    { key: 'pct_received', label: '%Received', apiKey: 'pct_received' },
    
    // Expense measures
    { key: 'total_pre_encumbered_amt', label: 'Pre-Encumbrance', apiKey: 'total_pre_encumbered_amt' },
    { key: 'total_encumbered_amt', label: 'Encumbrance', apiKey: 'total_encumbered_amt' },
    { key: 'total_expenses', label: 'Actuals', apiKey: 'total_expenses' },
    { key: 'total_exp_variance', label: 'Variance', apiKey: 'total_exp_variance' },
    { key: 'pct_budget_spent', label: '%Spent', apiKey: 'pct_budget_spent' }
];

  const operators = [
    { value: '=', label: '=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' }
  ];

  const updateFilter = (field, filterData) => {
    onFiltersChange({
      ...filters,
      [field]: filterData
    });
  };

  // Validation function for input values
  const validateValue = (fieldKey, value, isSecondValue = false) => {
    if (!measureStats?.measures || !value) return { isValid: true, error: '' };
    
    const stats = measureStats.measures[fieldKey];
    if (!stats) return { isValid: true, error: '' };
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { isValid: false, error: 'Invalid number' };
    
    const { min, max } = stats;
    
    if (numValue < min || numValue > max) {
      return {
        isValid: false,
        error: `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}`
      };
    }
    
    return { isValid: true, error: '' };
  };

  // Get field statistics for display
  const getFieldStats = (fieldKey) => {
    if (!measureStats?.measures || !measureStats.measures[fieldKey]) return null;
    const stats = measureStats.measures[fieldKey];
    return {
      min: stats.min,
      max: stats.max,
      avg: stats.avg
    };
  };

  const generateMeasuresCriteria = () => {
    let criteria = '';
    Object.entries(filters).forEach(([field, filter]) => {
      if (filter.operator && filter.value) {
        if (criteria) criteria += ' and ';
        criteria += `${field} ${filter.operator} ${filter.value}`;
        if (filter.operator === '>' && filter.secondValue) {
          criteria += ` and ${field} < ${filter.secondValue}`;
        }
        if (filter.operator === '>=' && filter.secondValue) {
          criteria += ` and ${field} <= ${filter.secondValue}`;
        }
      }
    });
    setMeasureFiltersQuery(criteria ? `where ${criteria}` : '')
    return criteria ? `where ${criteria}` : '';
  };

  if (!userId || !sessionId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-600">Error: User ID or Session ID not found in localStorage</div>
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Measure Filters</h3>
      
      <div className="space-y-4 mb-6">
        {measureFields.map(field => {
          const stats = getFieldStats(field.apiKey);
          const firstValueValidation = validateValue(field.apiKey, filters[field.key]?.value);
          const secondValueValidation = validateValue(field.apiKey, filters[field.key]?.secondValue, true);
          
          return (
            <div key={field.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-2">
                <h4 className="text-sm font-medium text-gray-700 w-32">
                  {field.label}:
                </h4>
                
                <select
                  value={filters[field.key]?.operator || ''}
                  onChange={(e) => updateFilter(field.key, { ...filters[field.key], operator: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-20"
                >
                  <option value="">Select</option>
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>

                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Value"
                    value={filters[field.key]?.value || ''}
                    onChange={(e) => updateFilter(field.key, { ...filters[field.key], value: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !firstValueValidation.isValid ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {!firstValueValidation.isValid && (
                    <p className="text-red-500 text-xs mt-1">{firstValueValidation.error}</p>
                  )}
                </div>

                {(filters[field.key]?.operator === '>' || filters[field.key]?.operator === '>=') && (
                  <>
                    <span className="text-sm text-gray-500">and</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder={filters[field.key]?.operator === '>' ? "< value (optional)" : "<= value (optional)"}
                        value={filters[field.key]?.secondValue || ''}
                        onChange={(e) => updateFilter(field.key, { ...filters[field.key], secondValue: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !secondValueValidation.isValid ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {!secondValueValidation.isValid && (
                        <p className="text-red-500 text-xs mt-1">{secondValueValidation.error}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Display field statistics */}
              {stats && (
                <div className="text-xs text-gray-500 ml-37">
                  Min: {stats.min.toLocaleString()} | Max: {stats.max.toLocaleString()} | Avg: {stats.avg.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview of generated criteria */}
     {userId == 'admin' &&  <div className="mt-6 p-4 rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Measures Criteria:</h4>
        <code className="text-sm text-gray-600 break-all">
                   {generateMeasuresCriteria() || 'No filters applied'}

        </code>
      </div>
}
    </div>
  );
};

export default MeasureFilter;