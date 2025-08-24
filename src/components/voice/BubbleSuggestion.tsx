import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, ChevronRight, Loader2 } from 'lucide-react';

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
  }>({ years: [], fundCodes: [], departments: [] });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        handleVoiceCommand(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetch(`${API_BASE_URL}/budget-years`)
      .then(res => res.json())
      .then(data => setAvailableOptions(prev => ({ ...prev, years: data.budget_years })))
      .catch(console.error);
  }, []);

  const handleVoiceCommand = (transcript: string) => {
    if (transcript.includes('all')) {
      handleSelectAll();
      return;
    }

    const options = currentStep === 'year' ? availableOptions.years.map(y => [y, y]) :
                   currentStep === 'funds' ? availableOptions.fundCodes :
                   availableOptions.departments;
    
    const matches = options.filter(([value, label]) => 
      transcript.includes(value.toLowerCase()) || transcript.includes(label.toLowerCase())
    );
    
    if (matches.length > 0) {
      if (currentStep === 'year') setFormData(prev => ({ ...prev, budgetYear: matches[0][0] }));
      else if (currentStep === 'funds') matches.forEach(([value]) => handleFundSelect(value));
      else matches.forEach(([value]) => handleDepartmentSelect(value));
    }
  };

  const handleSelectAll = () => {
    if (currentStep === 'funds') {
      const allFundCodes = availableOptions.fundCodes.map(([value]) => value);
      setFormData(prev => ({ ...prev, fundCodes: allFundCodes }));
    } else if (currentStep === 'departments') {
      const allDepartments = availableOptions.departments.map(([value]) => value);
      setFormData(prev => ({ ...prev, departments: allDepartments }));
    }
  };

  const handleYearSelect = (year: string) => {
    setFormData(prev => ({ ...prev, budgetYear: year, fundCodes: [], departments: [] }));
  };

  const handleFundSelect = (fundCode: string) => {
    if (disabled) return;
    const newFundCodes = formData.fundCodes.includes(fundCode)
      ? formData.fundCodes.filter(c => c !== fundCode)
      : [...formData.fundCodes, fundCode];
    
    setFormData(prev => ({ ...prev, fundCodes: newFundCodes, departments: [] }));
  };

  const handleDepartmentSelect = (deptCode: string) => {
    if (disabled) return;
    const newDepartments = formData.departments.includes(deptCode)
      ? formData.departments.filter(d => d !== deptCode)
      : [...formData.departments, deptCode];
    setFormData(prev => ({ ...prev, departments: newDepartments }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'year': return formData.budgetYear !== '';
      case 'funds': return formData.fundCodes.length > 0;
      case 'departments': return formData.departments.length > 0;
      default: return false;
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (currentStep === 'year' && formData.budgetYear) {
        const res = await fetch(`${API_BASE_URL}/fund-codes?year=${encodeURIComponent(formData.budgetYear)}`);
        const data = await res.json();
        setAvailableOptions(prev => ({ ...prev, fundCodes: data.fund_codes, departments: [] }));
        setCurrentStep('funds');
      } else if (currentStep === 'funds' && formData.fundCodes.length > 0) {
        const deptMap = new Map();
        for (const code of formData.fundCodes) {
          const res = await fetch(`${API_BASE_URL}/departments?year=${encodeURIComponent(formData.budgetYear)}&fund_code=${encodeURIComponent(code)}`);
          if (res.ok) {
            const data = await res.json();
            data.departments.forEach(([value, label]: [string, string]) => deptMap.set(value, label));
          }
        }
        setAvailableOptions(prev => ({ ...prev, departments: Array.from(deptMap.entries()) }));
        setCurrentStep('departments');
      } else if (currentStep === 'departments' && formData.departments.length > 0) {
        setCurrentStep('complete');
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const resetToStep = (step: Step) => {
    setCurrentStep(step);
    if (step === 'year') setFormData(prev => ({ ...prev, budgetYear: '', fundCodes: [], departments: [] }));
    else if (step === 'funds') setFormData(prev => ({ ...prev, fundCodes: [], departments: [] }));
    else if (step === 'departments') setFormData(prev => ({ ...prev, departments: [] }));
  };

  const renderSelectedItems = (items: string[], options: [string, string][], color: string, resetStep: Step) => {
    const getLabel = (value: string) => options.find(([val]) => val === value)?.[1] || value;
    const visible = items.slice(0, 3);
    const remaining = items.length - 3;
    
    return (
      <div className="flex items-center gap-0.5">
        {visible.map(item => (
          <span key={item} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-${color}-50 text-${color}-700 rounded-full text-xs border border-${color}-200`}>
            {getLabel(item).length > 12 ? getLabel(item).slice(0, 12) + '...' : getLabel(item)}
            <button onClick={() => resetStep === 'funds' ? handleFundSelect(item) : handleDepartmentSelect(item)} className={`hover:bg-${color}-200 rounded-full p-0.5`}>
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        {remaining > 0 && (
          <span className={`px-1.5 py-0.5 bg-${color}-50 text-${color}-700 rounded-full text-xs border border-${color}-200`}>
            +{remaining} more
          </span>
        )}
      </div>
    );
  };

  const isFormComplete = formData.budgetYear && formData.fundCodes.length > 0 && formData.departments.length > 0;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            {[formData.budgetYear, formData.fundCodes.length > 0, formData.departments.length > 0].map((completed, i) => (
              <React.Fragment key={i}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  completed ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500 border border-gray-300'
                }`}>
                  {completed ? <Check className="w-2.5 h-2.5" /> : i + 1}
                </div>
                {i < 2 && <div className={`h-0.5 w-4 transition-all ${completed ? 'bg-green-300' : 'bg-gray-300'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Selected Items */}
          <div className="flex items-center gap-1 flex-1 justify-center overflow-hidden">
            {formData.budgetYear && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">
                {formData.budgetYear}
                <button onClick={() => resetToStep('year')} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {formData.fundCodes.length > 0 && renderSelectedItems(formData.fundCodes, availableOptions.fundCodes, 'green', 'funds')}
            {formData.departments.length > 0 && renderSelectedItems(formData.departments, availableOptions.departments, 'purple', 'departments')}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-2.5">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {currentStep === 'year' ? 'Select Budget Year' : 
           currentStep === 'funds' ? 'Select Fund Codes' : 
           currentStep === 'departments' ? 'Select Departments' : 'Ready to Generate'}
        </h4>

        {loading ? (
          <div className="flex items-center gap-2 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {currentStep === 'year' && availableOptions.years.map(year => (
                <button key={year} onClick={() => handleYearSelect(year)} disabled={disabled}
                  className={`px-2.5 py-1 border rounded text-xs font-medium transition-all ${
                    formData.budgetYear === year ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400'
                  }`}>
                  {year}
                </button>
              ))}

              {currentStep === 'funds' && availableOptions.fundCodes.map(([value, label]) => (
                <label key={value} className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded cursor-pointer transition-all text-xs ${
                  formData.fundCodes.includes(value) ? 'bg-green-50 border-green-400 text-green-800' : 'bg-white border-gray-300 hover:bg-green-50'
                }`}>
                  <input type="checkbox" checked={formData.fundCodes.includes(value)} onChange={() => handleFundSelect(value)} disabled={disabled}
                    className="w-3 h-3 text-green-600 border-gray-300 rounded" />
                  <span className="font-medium">{label}</span>
                </label>
              ))}

              {currentStep === 'departments' && availableOptions.departments.map(([value, label]) => (
                <label key={value} className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded cursor-pointer transition-all text-xs ${
                  formData.departments.includes(value) ? 'bg-purple-50 border-purple-400 text-purple-800' : 'bg-white border-gray-300 hover:bg-purple-50'
                }`}>
                  <input type="checkbox" checked={formData.departments.includes(value)} onChange={() => handleDepartmentSelect(value)} disabled={disabled}
                    className="w-3 h-3 text-purple-600 border-gray-300 rounded" />
                  <span className="font-medium">{label}</span>
                </label>
              ))}

             
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => isListening ? recognitionRef.current?.stop() : recognitionRef.current?.start()}
                disabled={disabled || loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-all ${
                  isListening ? 'bg-red-50 border-red-300 text-red-600' : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? 'Stop Voice' : 'Voice'}
              </button>

              {(currentStep === 'funds' || currentStep === 'departments') && availableOptions[currentStep === 'funds' ? 'fundCodes' : 'departments'].length > 0 && (
                <button 
                  onClick={handleSelectAll}
                  disabled={disabled}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-all"
                >
                  Select All
                </button>
              )}

              {currentStep !== 'complete' && canProceedToNext() && (
                <button onClick={handleNext} disabled={disabled || loading} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-1">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Next'} 
                  {!loading && <ChevronRight className="w-3 h-3" />}
                </button>
              )}
              
              {currentStep === 'complete' && (
                <button 
                  onClick={() => onParametersSubmit(formData)} 
                  disabled={disabled || !isFormComplete} 
                  className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${
                    disabled || !isFormComplete 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Generate Report
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};