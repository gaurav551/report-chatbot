import React, { useState, useEffect } from 'react';

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

export const BubbleSuggestion: React.FC<BubbleSuggestionProps> = ({
  sessionId,
  onParametersSubmit,
  disabled = false,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('year');
  const [formData, setFormData] = useState<BubbleSuggestionData>({
    reportSelection: 'Current Version',
    budgetYear: '',
    fundCodes: [],
    departments: [],
  });

  const [availableOptions, setAvailableOptions] = useState<{
    years: string[];
    fundCodes: [string, string][];
    departments: [string, string][];
  }>({
    years: [],
    fundCodes: [],
    departments: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBudgetYears = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/budget-years`);
        const data = await res.json();
        setAvailableOptions(prev => ({ ...prev, years: data.budget_years }));
      } catch (err) {
        console.error('Error loading budget years:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBudgetYears();
  }, []);

  const handleYearSelect = async (year: string) => {
    setFormData(prev => ({ ...prev, budgetYear: year, fundCodes: [], departments: [] }));
    try {
      setLoading(true);
      const valid = await validateBudgetYear(year);
      if (valid) {
        const fundCodes = await fetchFundCodes(year);
        setAvailableOptions(prev => ({ ...prev, fundCodes, departments: [] }));
        setCurrentStep('funds');
      }
    } catch (err) {
      console.error('Error loading fund codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFundSelect = async (fundCode: string) => {
    const newFundCodes = formData.fundCodes.includes(fundCode)
      ? formData.fundCodes.filter(c => c !== fundCode)
      : [...formData.fundCodes, fundCode];
    
    setFormData(prev => ({ ...prev, fundCodes: newFundCodes, departments: [] }));
    
    if (newFundCodes.length > 0) {
      try {
        setLoading(true);
        const departments = await fetchDepartments(formData.budgetYear, newFundCodes);
        setAvailableOptions(prev => ({ ...prev, departments }));
        setCurrentStep('departments');
      } catch (err) {
        console.error('Error loading departments:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setAvailableOptions(prev => ({ ...prev, departments: [] }));
      setCurrentStep('funds');
    }
  };

  const handleDepartmentSelect = (deptCode: string) => {
    const newDepartments = formData.departments.includes(deptCode)
      ? formData.departments.filter(d => d !== deptCode)
      : [...formData.departments, deptCode];
    
    setFormData(prev => ({ ...prev, departments: newDepartments }));
    setCurrentStep(newDepartments.length > 0 ? 'complete' : 'departments');
  };

  const validateBudgetYear = async (year: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/validate-budget-year?year=${encodeURIComponent(year)}`);
    const data = await res.json();
    return data.valid;
  };

  const fetchFundCodes = async (year: string): Promise<[string, string][]> => {
    const res = await fetch(`${API_BASE_URL}/fund-codes?year=${encodeURIComponent(year)}`);
    const data = await res.json();
    return data.fund_codes;
  };

  const fetchDepartments = async (
    year: string,
    fundCodes: string[]
  ): Promise<[string, string][]> => {
    const deptMap = new Map<string, string>();
    for (const fundCode of fundCodes) {
      try {
        const res = await fetch(`${API_BASE_URL}/departments?year=${encodeURIComponent(year)}&fund_code=${encodeURIComponent(fundCode)}`);
        if (res.ok) {
          const data = await res.json();
          for (const [value, label] of data.departments) {
            deptMap.set(value, label);
          }
        }
      } catch (err) {
        console.error(`Failed to load departments for fundCode ${fundCode}:`, err);
      }
    }
    return Array.from(deptMap.entries()) as [string, string][];
  };

  const resetToStep = (step: Step) => {
    setCurrentStep(step);
    if (step === 'year') {
      setFormData(prev => ({ ...prev, budgetYear: '', fundCodes: [], departments: [] }));
      setAvailableOptions(prev => ({ ...prev, fundCodes: [], departments: [] }));
    } else if (step === 'funds') {
      setFormData(prev => ({ ...prev, fundCodes: [], departments: [] }));
      setAvailableOptions(prev => ({ ...prev, departments: [] }));
    } else if (step === 'departments') {
      setFormData(prev => ({ ...prev, departments: [] }));
    }
  };

  const isFormComplete = formData.budgetYear && formData.fundCodes.length > 0 && formData.departments.length > 0;

  return (
    <div className="w-full p-3 bg-gray-50 border-b">
      {/* Steps + Selected Items + Generate */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Steps Progress */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${formData.budgetYear ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${formData.fundCodes.length > 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${formData.departments.length > 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>

          {/* Selected Items */}
          <div className="flex items-center gap-2">
            {formData.budgetYear && (
              <button onClick={() => resetToStep('year')} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200">
                {formData.budgetYear} ×
              </button>
            )}
            {formData.fundCodes.length > 0 && (
              <div className="flex items-center gap-1">
                {formData.fundCodes.slice(0, 2).map(code => {
                  const label = availableOptions.fundCodes.find(([val]) => val === code)?.[1] || code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleFundSelect(code, false)}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                    >
                      {label} ×
                    </button>
                  );
                })}
                {formData.fundCodes.length > 2 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    +{formData.fundCodes.length - 2} more
                  </span>
                )}
              </div>
            )}
            {formData.departments.length > 0 && (
              <div className="flex items-center gap-1">
                {formData.departments.slice(0, 2).map(dept => {
                  const label = availableOptions.departments.find(([val]) => val === dept)?.[1] || dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => handleDepartmentSelect(dept)}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
                    >
                      {label} ×
                    </button>
                  );
                })}
                {formData.departments.length > 2 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    +{formData.departments.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {isFormComplete && (
          <button
            onClick={() => onParametersSubmit(formData)}
            disabled={disabled}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 disabled:bg-gray-300 shadow-sm"
          >
            Generate Report
          </button>
        )}
      </div>

      {/* Current Step Options */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {currentStep === 'year' && (
            availableOptions.years.length > 0 ? (
              availableOptions.years.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  disabled={disabled}
                  className="px-3 py-1 bg-white hover:bg-blue-50 border border-gray-200 rounded text-sm transition-colors"
                >
                  {year}
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500">No budget years available</div>
            )
          )}
          
          {currentStep === 'funds' && (
            availableOptions.fundCodes.length > 0 ? (
              availableOptions.fundCodes.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleFundSelect(value, !formData.fundCodes.includes(value))}
                  disabled={disabled}
                  className={`px-3 py-1 border rounded text-sm transition-colors ${
                    formData.fundCodes.includes(value)
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-white hover:bg-green-50 border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500">No fund codes available for {formData.budgetYear}</div>
            )
          )}
          
          {currentStep === 'departments' && (
            availableOptions.departments.length > 0 ? (
              availableOptions.departments.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleDepartmentSelect(value)}
                  disabled={disabled}
                  className={`px-3 py-1 border rounded text-sm transition-colors ${
                    formData.departments.includes(value)
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-white hover:bg-purple-50 border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500">No departments available for selected fund codes</div>
            )
          )}
        </div>
      )}
    </div>
  );
};