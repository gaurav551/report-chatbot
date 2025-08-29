import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, ChevronRight, Loader2, ChevronUp, Search } from 'lucide-react';

export interface BubbleSuggestionData {
  reportSelection: string;
  budgetYear: string;
  fundCodes: string[];
  departments: string[];
}

interface BubbleSuggestionProps {
  sessionId: string;
  onParametersSubmit: (params: BubbleSuggestionData) => void;
  disabled?: boolean;
}

const API_BASE_URL = 'https://agentic.aiweaver.ai/api';
type Step = 'year' | 'funds' | 'departments' | 'complete';

interface DropdownOption {
  key: string;
  value: string;
}

interface BubbleDropdownProps {
  label: string;
  options: DropdownOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  showSelectAll?: boolean;
  onAutoNext?: () => void;
}

const BubbleDropdown: React.FC<BubbleDropdownProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder,
  loading = false,
  disabled = false,
  showSelectAll = true,
  onAutoNext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-advance when selections are made
  useEffect(() => {
    if (selectedValues.length > 0 && onAutoNext) {
      const timer = setTimeout(() => {
        onAutoNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedValues.length, onAutoNext]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedValues.length === filteredOptions.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredOptions.map(opt => opt.key));
    }
  };

  const handleOptionToggle = (optionKey: string) => {
    if (selectedValues.includes(optionKey)) {
      onSelectionChange(selectedValues.filter(val => val !== optionKey));
    } else {
      onSelectionChange([...selectedValues, optionKey]);
    }
  };

  const handleRemoveSelection = (optionKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedValues.filter(val => val !== optionKey));
  };

  // Render selected items as compact bubbles
  const renderSelectedBubbles = () => {
    if (selectedValues.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mb-1">
        {selectedValues.slice(0, 3).map(key => {
          const option = options.find(opt => opt.key === key);
          if (!option) return null;
          
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
            >
              <span className="truncate max-w-20">{option.value}</span>
              {!disabled && (
                <button
                  onClick={(e) => handleRemoveSelection(key, e)}
                  className="flex-shrink-0 w-2.5 h-2.5 flex items-center justify-center hover:bg-blue-200 rounded-full transition-colors"
                >
                  <X className="w-2 h-2" />
                </button>
              )}
            </span>
          );
        })}
        {selectedValues.length > 3 && (
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{selectedValues.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {/* Selected Bubbles */}
      {renderSelectedBubbles()}
      
      {/* Compact Bubble Button */}
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className={`inline-flex items-center px-3 py-2 text-white text-sm font-medium rounded-full transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'cursor-pointer bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>
              {label}
              {selectedValues.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {selectedValues.length}
                </span>
              )}
              <ChevronUp className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} />
            </>
          )}
        </button>

        {/* Dropdown Panel - Opens Above */}
        {isOpen && !disabled && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden min-w-64">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {/* Select All Option */}
              {showSelectAll && filteredOptions.length > 1 && (
                <div
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50"
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                    selectedValues.length === filteredOptions.length
                      ? 'bg-blue-500 border-blue-500'
                      : selectedValues.length > 0
                      ? 'bg-blue-100 border-blue-300'
                      : 'border-gray-300'
                  }`}>
                    {selectedValues.length === filteredOptions.length && (
                      <Check className="w-2 h-2 text-white" />
                    )}
                    {selectedValues.length > 0 && selectedValues.length < filteredOptions.length && (
                      <div className="w-1 h-1 bg-blue-500 rounded" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Select All
                  </span>
                </div>
              )}

              {/* Individual Options */}
              {filteredOptions.map((option) => (
                <div
                  key={option.key}
                  onClick={() => handleOptionToggle(option.key)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                    selectedValues.includes(option.key)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}>
                    {selectedValues.includes(option.key) && (
                      <Check className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-700 truncate">{option.value}</div>
                  </div>
                </div>
              ))}

              {/* No Results */}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-4 text-center text-gray-500 text-xs">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const BubbleSuggestion: React.FC<BubbleSuggestionProps> = ({
  sessionId, onParametersSubmit, disabled = false
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('year');
  const [formData, setFormData] = useState<BubbleSuggestionData>({
    reportSelection: 'Current Version', 
    budgetYear: '', 
    fundCodes: [], 
    departments: []
  });
  
  const [availableOptions, setAvailableOptions] = useState<{
    years: string[]; 
    fundCodes: DropdownOption[]; 
    departments: DropdownOption[];
  }>({ years: [], fundCodes: [], departments: [] });
  
  const [loading, setLoading] = useState({
    fundCodes: false,
    departments: false
  });
  
  const [error, setError] = useState<string>('');

  // API calls
  const loadBudgetYears = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/budget-years`);
      if (!res.ok) throw new Error('Failed to load budget years');
      const data = await res.json();
      setAvailableOptions(prev => ({ ...prev, years: data.budget_years }));
    } catch (error) {
      setError('Failed to load budget years');
      setTimeout(() => setError(''), 3000);
    }
  }, []);

  const loadFundCodes = useCallback(async (year: string) => {
    if (!year) return;
    setLoading(prev => ({ ...prev, fundCodes: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/fund-codes?year=${encodeURIComponent(year)}`);
      if (!res.ok) throw new Error('Failed to load fund codes');
      const data = await res.json();
      const fundOptions: DropdownOption[] = data.fund_codes.map(([key, value]: [string, string]) => ({
        key,
        value
      }));
      setAvailableOptions(prev => ({ ...prev, fundCodes: fundOptions, departments: [] }));
    } catch (error) {
      setError('Failed to load fund codes');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(prev => ({ ...prev, fundCodes: false }));
  }, []);

  const loadDepartments = useCallback(async (year: string, fundCodes: string[]) => {
    if (!year || fundCodes.length === 0) return;
    setLoading(prev => ({ ...prev, departments: true }));
    try {
      const deptMap = new Map<string, string>();
      for (const code of fundCodes) {
        const res = await fetch(`${API_BASE_URL}/departments?year=${encodeURIComponent(year)}&fund_code=${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          data.departments.forEach(([key, value]: [string, string]) => deptMap.set(key, value));
        }
      }
      const deptOptions: DropdownOption[] = Array.from(deptMap.entries()).map(([key, value]) => ({
        key,
        value
      }));
      setAvailableOptions(prev => ({ ...prev, departments: deptOptions }));
    } catch (error) {
      setError('Failed to load departments');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(prev => ({ ...prev, departments: false }));
  }, []);

  useEffect(() => { 
    loadBudgetYears(); 
  }, [loadBudgetYears]);

  // Auto-advance handlers
  const selectYear = useCallback(async (year: string) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, budgetYear: year, fundCodes: [], departments: [] }));
    await loadFundCodes(year);
    
    setTimeout(() => {
      setCurrentStep('funds');
    }, 300);
  }, [disabled, loadFundCodes]);

  const handleFundCodeChange = useCallback(async (fundCodes: string[]) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, fundCodes, departments: [] }));
    
    if (fundCodes.length > 0 && formData.budgetYear) {
      await loadDepartments(formData.budgetYear, fundCodes);
    } else {
      setAvailableOptions(prev => ({ ...prev, departments: [] }));
    }
  }, [disabled, formData.budgetYear, loadDepartments]);

  const handleDepartmentChange = useCallback((departments: string[]) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, departments }));
  }, [disabled]);

  const handleAutoAdvanceToComplete = useCallback(() => {
    if (formData.departments.length > 0) {
      setCurrentStep('complete');
    }
  }, [formData.departments.length]);

  const handleAutoAdvanceToDepartments = useCallback(() => {
    if (formData.fundCodes.length > 0) {
      setCurrentStep('departments');
    }
  }, [formData.fundCodes.length]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    setFormData({
      reportSelection: 'Current Version',
      budgetYear: '',
      fundCodes: [],
      departments: [],
    });
    setCurrentStep('year');
    setAvailableOptions(prev => ({ ...prev, fundCodes: [], departments: [] }));
  }, [disabled]);

  // Helper function to format selected items compactly
  const formatSelectedItems = (items: string[], options: DropdownOption[], maxDisplay = 1) => {
    if (items.length === 0) return '';
    
    const selectedOptions = items.map(key => 
      options.find(opt => opt.key === key)?.value || key
    );
    
    if (selectedOptions.length <= maxDisplay) {
      return selectedOptions.join(', ');
    }
    
    const displayItems = selectedOptions.slice(0, maxDisplay);
    const remainingCount = selectedOptions.length - maxDisplay;
    
    return `${displayItems.join(', ')}, +${remainingCount}`;
  };

  // Render helpers
  const renderProgressDots = () => {
    const steps = ['year', 'funds', 'departments'];
    const completed = [
      formData.budgetYear !== '', 
      formData.fundCodes.length > 0, 
      formData.departments.length > 0
    ];
    
    return (
      <div className="flex items-center gap-1">
        {completed.map((isCompleted, index) => (
          <div key={index} className={`w-2 h-2 rounded-full transition-colors ${
            isCompleted ? 'bg-green-500' : 
            currentStep === steps[index] ? 'bg-blue-500' : 'bg-gray-300'
          }`} />
        ))}
      </div>
    );
  };

  const renderCompactSummary = () => {
    const parts = [];
    
    if (formData.budgetYear) {
      parts.push(formData.budgetYear);
    }
    
    if (formData.fundCodes.length > 0) {
      parts.push(`${formData.fundCodes.length} funds`);
    }
    
    if (formData.departments.length > 0) {
      parts.push(`${formData.departments.length} depts`);
    }

    if (parts.length === 0) return null;

    return (
      <div className="text-xs text-gray-600 mb-2">
        {parts.join(' • ')}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'year':
        return (
          <div className="flex flex-wrap gap-1">
            {availableOptions.years.slice(0, 6).map(year => (
              <button
                key={year}
                onClick={() => selectYear(year)}
                disabled={disabled}
                className={`px-3 py-1.5 text-sm font-medium rounded border transition-all ${
                  formData.budgetYear === year
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {year}
              </button>
            ))}
          </div>
        );

      case 'funds':
        return (
          <BubbleDropdown
            label="Fund Codes"
            options={availableOptions.fundCodes}
            selectedValues={formData.fundCodes}
            onSelectionChange={handleFundCodeChange}
            placeholder={!formData.budgetYear ? 'Select year first' : 'Choose fund codes...'}
            loading={loading.fundCodes}
            disabled={disabled || !formData.budgetYear}
            showSelectAll={true}
            onAutoNext={handleAutoAdvanceToDepartments}
          />
        );

      case 'departments':
        return (
          <BubbleDropdown
            label="Departments"
            options={availableOptions.departments}
            selectedValues={formData.departments}
            onSelectionChange={handleDepartmentChange}
            placeholder={formData.fundCodes.length === 0 ? 'Select fund codes first' : 'Choose departments...'}
            loading={loading.departments}
            disabled={disabled || formData.fundCodes.length === 0}
            showSelectAll={true}
            onAutoNext={handleAutoAdvanceToComplete}
          />
        );

      
      
      default: 
        return null;
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Error notification */}
      {error && (
        <div className="px-2 py-1 bg-red-50 border-b border-red-100">
          <div className="text-xs text-red-600 flex items-center gap-1">
            <X className="w-3 h-3" />
            {error}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="p-1.5">
        {/* Progress & Summary */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {renderProgressDots()}
            <span className="text-xs font-medium text-gray-700">
              {currentStep === 'year' ? 'Year' : 
               currentStep === 'funds' ? 'Funds' : 
               currentStep === 'departments' ? 'Departments' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Compact Summary */}
        {renderCompactSummary()}

        {/* Step Content */}
        <div className="mb-1">
          {renderStepContent()}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={handleClear}
            disabled={disabled}
            className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-xs transition-colors disabled:opacity-50"
          >
            <X className="w-3 h-3" />
            Clear
          </button>

          {currentStep === 'complete' && (
            <button
              onClick={() => onParametersSubmit(formData)}
              disabled={disabled}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check className="w-3 h-3" />
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};