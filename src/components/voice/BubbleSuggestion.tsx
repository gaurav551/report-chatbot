import React, { useState, useEffect, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { BubbleDropdown } from '../ui/BubbleDropdown';

export interface BubbleSuggestionData {
  reportSelection: string;
  budgetYear: string;
  fundCodes: string[];
  departments: string[];
}

export interface BubbleSuggestionProps {
  sessionId: string;
  onParametersSubmit: (params: BubbleSuggestionData) => void;
  disabled?: boolean;
}

const API_BASE_URL = 'https://agentic.aiweaver.ai/api';
type Step = 'year' | 'funds' | 'departments' | 'complete';

export interface DropdownOption {
  key: string;
  value: string;
}

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
  
  const [loading, setLoading] = useState({ fundCodes: false, departments: false });
  const [error, setError] = useState<string>('');

  // API calls
  const apiCall = async (endpoint: string, errorMsg: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(errorMsg);
    return res.json();
  };

  const loadBudgetYears = useCallback(async () => {
    try {
      const data = await apiCall('/budget-years', 'Failed to load budget years');
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
      const data = await apiCall(`/fund-codes?year=${encodeURIComponent(year)}`, 'Failed to load fund codes');
      const fundOptions: DropdownOption[] = data.fund_codes.map(([key, value]: [string, string]) => ({ key, value }));
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
        try {
          const data = await apiCall(`/departments?year=${encodeURIComponent(year)}&fund_code=${encodeURIComponent(code)}`, '');
          data.departments.forEach(([key, value]: [string, string]) => deptMap.set(key, value));
        } catch {} // Continue if individual request fails
      }
      const deptOptions: DropdownOption[] = Array.from(deptMap.entries()).map(([key, value]) => ({ key, value }));
      setAvailableOptions(prev => ({ ...prev, departments: deptOptions }));
    } catch (error) {
      setError('Failed to load departments');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(prev => ({ ...prev, departments: false }));
  }, []);

  useEffect(() => { loadBudgetYears(); }, [loadBudgetYears]);

  // Auto-advance and auto-submit logic
  const selectYear = useCallback(async (year: string) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, budgetYear: year, fundCodes: [], departments: [] }));
    await loadFundCodes(year);
    setTimeout(() => setCurrentStep('funds'), 300);
  }, [disabled, loadFundCodes]);

  const handleFundCodeChange = useCallback(async (fundCodes: string[]) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, fundCodes, departments: [] }));
    
    if (fundCodes.length > 0 && formData.budgetYear) {
      await loadDepartments(formData.budgetYear, fundCodes);
      setTimeout(() => setCurrentStep('departments'), 300);
    } else {
      setAvailableOptions(prev => ({ ...prev, departments: [] }));
    }
  }, [disabled, formData.budgetYear, loadDepartments]);

  const handleDepartmentChange = useCallback((departments: string[]) => {
    if (disabled) return;
    const newFormData = { ...formData, departments };
    setFormData(newFormData);
    
    // Auto-submit when departments are selected
    if (departments.length > 0) {
      setTimeout(() => {
        setCurrentStep('complete');
        onParametersSubmit(newFormData);
      }, 300);
    }
  }, [disabled, formData, onParametersSubmit]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    setFormData({ reportSelection: 'Current Version', budgetYear: '', fundCodes: [], departments: [] });
    setCurrentStep('year');
    setAvailableOptions(prev => ({ ...prev, fundCodes: [], departments: [] }));
  }, [disabled]);

  // Render helpers
  const renderProgressDots = () => {
    const completed = [formData.budgetYear !== '', formData.fundCodes.length > 0, formData.departments.length > 0];
    const steps = ['year', 'funds', 'departments'];
    
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
    if (formData.budgetYear) parts.push(formData.budgetYear);
    if (formData.fundCodes.length > 0) parts.push(`${formData.fundCodes.length} funds`);
    if (formData.departments.length > 0) parts.push(`${formData.departments.length} depts`);

    return parts.length > 0 ? (
      <div className="text-xs text-gray-600 mb-2">{parts.join(' • ')}</div>
    ) : null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'year':
        const currentYear = new Date().getFullYear().toString();
        
        return (
          <div className="flex flex-wrap gap-1">
            {availableOptions.years.slice(0, 6).map(year => {
              const isCurrentYear = year === currentYear;
              const isSelected = formData.budgetYear === year;
              
              return (
                <button
                  key={year}
                  onClick={() => selectYear(year)}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-sm font-medium rounded border transition-all relative ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : isCurrentYear
                      ? 'bg-green-50 border-green-300 text-green-700 ring-2 ring-green-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {year}
                  {isCurrentYear && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        );

      case 'funds':
        return (
          <BubbleDropdown
            key={`funds-${formData.budgetYear}`}
            label="Fund Codes"
            options={availableOptions.fundCodes}
            selectedValues={formData.fundCodes}
            onSelectionChange={handleFundCodeChange}
            placeholder={!formData.budgetYear ? 'Select year first' : 'Choose fund codes...'}
            loading={loading.fundCodes}
            disabled={disabled || !formData.budgetYear}
            showSelectAll={true}
          />
        );

      case 'departments':
        return (
          <BubbleDropdown
            key={`departments-${formData.budgetYear}-${formData.fundCodes.join(',')}`}
            label="Departments"
            options={availableOptions.departments}
            selectedValues={formData.departments}
            onSelectionChange={handleDepartmentChange}
            placeholder={formData.fundCodes.length === 0 ? 'Select fund codes first' : 'Choose departments...'}
            loading={loading.departments}
            disabled={disabled || formData.fundCodes.length === 0}
            showSelectAll={true}
          />
        );

      case 'complete':
        return null;

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
            <div className='text-sm text-gray-600'>
              Parameters Saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};