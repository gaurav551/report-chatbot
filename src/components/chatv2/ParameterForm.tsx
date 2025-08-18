import React, { useState, useEffect } from 'react';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import CompactYearCarousel from '../ui/ModernYearSlider';

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
  disabled = false,
}) => {
  const [formData, setFormData] = useState<ParameterFormData>({
    reportSelection: 'Current Version',
    budgetYear: '',
    fundCodes: [],
    departments: [],
  });

  const [availableData, setAvailableData] = useState({
    budgetYears: [] as string[],
    fundCodes: [] as [string, string][],
    departments: [] as [string, string][],
  });

  const [loading, setLoading] = useState({
    budgetYears: false,
    fundCodes: false,
    departments: false,
  });

  // Fetch budget years on mount
  useEffect(() => {
    const loadBudgetYears = async () => {
      try {
        setLoading((prev) => ({ ...prev, budgetYears: true }));
        const res = await fetch(`${API_BASE_URL}/budget-years`);
        const data = await res.json();
        setAvailableData((prev) => ({ ...prev, budgetYears: data.budget_years }));
      } catch (err) {
        console.error('Error loading budget years:', err);
      } finally {
        setLoading((prev) => ({ ...prev, budgetYears: false }));
      }
    };

    loadBudgetYears();
  }, []);

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

  const handleBudgetYearChange = async (year: string) => {
    setFormData((prev) => ({
      ...prev,
      budgetYear: year,
      fundCodes: [],
      departments: [],
    }));
    setAvailableData((prev) => ({
      ...prev,
      fundCodes: [],
      departments: [],
    }));

    if (year) {
      try {
        setLoading((prev) => ({ ...prev, fundCodes: true }));
        const valid = await validateBudgetYear(year);
        if (valid) {
          const fundCodes = await fetchFundCodes(year);
          setAvailableData((prev) => ({ ...prev, fundCodes }));
        }
      } catch (err) {
        console.error('Error loading fund codes:', err);
      } finally {
        setLoading((prev) => ({ ...prev, fundCodes: false }));
      }
    }
  };

  const handleFundCodeChange = async (code: string, isSelected: boolean) => {
    let updatedCodes: string[] = [];

    if (code === 'ALL') {
      updatedCodes = isSelected ? availableData.fundCodes.map(([val]) => val) : [];
    } else {
      updatedCodes = isSelected
        ? [...formData.fundCodes, code]
        : formData.fundCodes.filter((c) => c !== code);
    }

    setFormData((prev) => ({
      ...prev,
      fundCodes: updatedCodes,
      departments: [],
    }));
    setAvailableData((prev) => ({ ...prev, departments: [] }));

    if (updatedCodes.length > 0 && formData.budgetYear) {
      try {
        setLoading((prev) => ({ ...prev, departments: true }));
        const departments = await fetchDepartments(formData.budgetYear, updatedCodes);
        setAvailableData((prev) => ({ ...prev, departments }));
      } catch (err) {
        console.error('Error loading departments:', err);
      } finally {
        setLoading((prev) => ({ ...prev, departments: false }));
      }
    }
  };

  const handleDepartmentChange = (dept: string, isSelected: boolean) => {
    let updated: string[] = [];

    if (dept === 'ALL') {
      updated = isSelected ? availableData.departments.map(([val]) => val) : [];
    } else {
      updated = isSelected
        ? [...formData.departments, dept]
        : formData.departments.filter((d) => d !== dept);
    }

    setFormData((prev) => ({ ...prev, departments: updated }));
  };

  const isFormValid =
    formData.budgetYear &&
    formData.fundCodes.length > 0 &&
    formData.departments.length > 0;

  return (
    <div className="w-full border-b p-2 bg-gray-50/50">
      <div className="w-full">
        {/* Form Grid - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* Budget Year - Full Width in its column */}
          <div className="w-full">
            <CompactYearCarousel
              onChange={handleBudgetYearChange}
              value={formData.budgetYear}
              disabled={disabled || loading.budgetYears}
              years={availableData.budgetYears}
            />
          </div>

          {/* Fund Codes - Full Width in its column */}
          <div className="w-full">
            <MultiSelectDropdown
              label="Fund Codes"
              value={formData.fundCodes}
              options={availableData.fundCodes}
              loading={loading.fundCodes}
              disabled={disabled || !formData.budgetYear}
              placeholder={
                !formData.budgetYear ? 'Select year first' : 'Select Fund Codes'
              }
              onChange={handleFundCodeChange}
              showSelectAll={true}
            />
          </div>

          {/* Departments - Full Width in its column */}
          <div className="w-full">
            <MultiSelectDropdown
              label="Departments"
              value={formData.departments}
              options={availableData.departments}
              loading={loading.departments}
              disabled={disabled || !formData.departments}
              placeholder={
                formData.fundCodes.length === 0
                  ? 'Select fund codes first'
                  : 'Select Departments'
              }
              onChange={handleDepartmentChange}
              showSelectAll={true}
            />
          </div>
        </div>

        {/* Submit Button - Left aligned and compact */}
        <div className="">
          <button
            onClick={() => onParametersSubmit(formData)}
            disabled={!isFormValid || disabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};