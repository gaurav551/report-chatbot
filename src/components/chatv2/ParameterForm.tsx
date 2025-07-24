import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { MultiSelectDropdown } from '../ui/MultiSelectDropdown';

export interface ParameterFormData {
  reportSelection: string;
  budgetYear: string;
  fundCodes: string[];
  departments: string[];
}

interface ParameterFormProps {
  sessionId: string;
  onParametersSubmit: (params: ParameterFormData) => void;
  disabled?: boolean;
}

const API_BASE_URL = 'https://agentic.aiweaver.ai/api';

export const ParameterForm: React.FC<ParameterFormProps> = ({
  sessionId,
  onParametersSubmit,
  disabled = false
}) => {
  const [formData, setFormData] = useState<ParameterFormData>({
    reportSelection: 'Current Version',
    budgetYear: '',
    fundCodes: [],
    departments: []
  });

  const [availableData, setAvailableData] = useState({
    budgetYears: [] as string[],
    fundCodes: [] as string[],
    departments: [] as string[]
  });

  const [loading, setLoading] = useState({
    budgetYears: false,
    fundCodes: false,
    departments: false
  });

  // API helper functions
  const fetchBudgetYears = async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/budget-years`);
    if (!response.ok) throw new Error('Failed to fetch budget years');
    const data = await response.json();
    return data.budget_years;
  };

  const validateBudgetYear = async (year: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/validate-budget-year?year=${encodeURIComponent(year)}`);
    if (!response.ok) throw new Error('Failed to validate budget year');
    const result = await response.json();
    return result.valid;
  };

  const fetchFundCodes = async (year: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/fund-codes?year=${encodeURIComponent(year)}`);
    if (!response.ok) throw new Error('Failed to fetch fund codes');
    const data = await response.json();
    return data.fund_codes;
  };

  const fetchDepartments = async (year: string, fundCodes: string[]): Promise<string[]> => {
    // For multiple fund codes, we'll fetch departments for each and combine
    const allDepartments = new Set<string>();
    
    for (const fundCode of fundCodes) {
      try {
        const response = await fetch(`${API_BASE_URL}/departments?year=${encodeURIComponent(year)}&fund_code=${encodeURIComponent(fundCode)}`);
        if (response.ok) {
          const data = await response.json();
          data.departments.forEach((dept: string) => allDepartments.add(dept));
        }
      } catch (error) {
        console.error(`Error fetching departments for fund code ${fundCode}:`, error);
      }
    }
    
    return Array.from(allDepartments);
  };

  // Load budget years on component mount
  useEffect(() => {
    const loadBudgetYears = async () => {
      try {
        setLoading(prev => ({ ...prev, budgetYears: true }));
        const years = await fetchBudgetYears();
        setAvailableData(prev => ({ ...prev, budgetYears: years }));
      } catch (error) {
        console.error('Error fetching budget years:', error);
      } finally {
        setLoading(prev => ({ ...prev, budgetYears: false }));
      }
    };

    loadBudgetYears();
  }, []);

  const handleBudgetYearChange = async (year: string) => {
    setFormData(prev => ({ 
      ...prev, 
      budgetYear: year, 
      fundCodes: [], 
      departments: [] 
    }));
    setAvailableData(prev => ({ 
      ...prev, 
      fundCodes: [], 
      departments: [] 
    }));
    
    if (year) {
      try {
        setLoading(prev => ({ ...prev, fundCodes: true }));
        const isValid = await validateBudgetYear(year);
        if (isValid) {
          const fundCodes = await fetchFundCodes(year);
          setAvailableData(prev => ({ ...prev, fundCodes }));
        }
      } catch (error) {
        console.error('Error loading fund codes:', error);
      } finally {
        setLoading(prev => ({ ...prev, fundCodes: false }));
      }
    }
  };

  const handleFundCodeChange = async (fundCode: string, isSelected: boolean) => {
    let newFundCodes: string[];
    
    if (fundCode === 'ALL') {
      // Handle "Select All" option
      newFundCodes = isSelected ? [...availableData.fundCodes] : [];
    } else {
      // Handle individual fund code selection
      newFundCodes = isSelected
        ? [...formData.fundCodes, fundCode]
        : formData.fundCodes.filter(code => code !== fundCode);
    }
    
    setFormData(prev => ({ 
      ...prev, 
      fundCodes: newFundCodes, 
      departments: [] 
    }));
    setAvailableData(prev => ({ ...prev, departments: [] }));
    
    if (newFundCodes.length > 0 && formData.budgetYear) {
      try {
        setLoading(prev => ({ ...prev, departments: true }));
        const departments = await fetchDepartments(formData.budgetYear, newFundCodes);
        setAvailableData(prev => ({ ...prev, departments }));
      } catch (error) {
        console.error('Error loading departments:', error);
      } finally {
        setLoading(prev => ({ ...prev, departments: false }));
      }
    }
  };

  const handleDepartmentChange = (department: string, isSelected: boolean) => {
    let newDepartments: string[];
    
    if (department === 'ALL') {
      // Handle "Select All" option
      newDepartments = isSelected ? [...availableData.departments] : [];
    } else {
      // Handle individual department selection
      newDepartments = isSelected
        ? [...formData.departments, department]
        : formData.departments.filter(dept => dept !== department);
    }
    
    setFormData(prev => ({ ...prev, departments: newDepartments }));
  };

  const isFormValid = formData.budgetYear && formData.fundCodes.length > 0 && formData.departments.length > 0;

  return (
    <div className="border-b p-3">
      <div className="max-w-5xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Selection */}
          <div>
            <select
              value={formData.reportSelection}
              onChange={(e) => setFormData(prev => ({ ...prev, reportSelection: e.target.value }))}
              className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled}
            >
              <option value="Current Version">Current Version</option>
              <option value="New Version Reports">New Version Reports</option>
            </select>
          </div>

          {/* Budget Year */}
          <div>
            <select
              value={formData.budgetYear}
              onChange={(e) => handleBudgetYearChange(e.target.value)}
              className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled || loading.budgetYears}
            >
              <option value="">
                {loading.budgetYears ? 'Loading years...' : 'Select Year'}
              </option>
              {availableData.budgetYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Fund Codes */}
          <MultiSelectDropdown
            label="Fund Codes"
            value={formData.fundCodes}
            options={['ALL', ...availableData.fundCodes]}
            loading={loading.fundCodes}
            disabled={disabled || !formData.budgetYear || loading.fundCodes}
            placeholder={!formData.budgetYear ? 'Select year first' : 'Select Fund Codes'}
            onChange={handleFundCodeChange}
            color="blue"
            showSelectAll={true}
            selectAllValue="ALL"
          />

          {/* Departments */}
          <MultiSelectDropdown
            label="Dept"
            value={formData.departments}
            options={['ALL', ...availableData.departments]}
            loading={loading.departments}
            disabled={disabled || formData.fundCodes.length === 0 || loading.departments}
            placeholder={formData.fundCodes.length === 0 ? 'Select fund codes first' : 'Select Departments'}
            onChange={handleDepartmentChange}
            color="green"
            showSelectAll={true}
            selectAllValue="ALL"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={() => onParametersSubmit(formData)}
          disabled={!isFormValid || disabled}
          className="px-6 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-4"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};