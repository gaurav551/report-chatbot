import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Check, X, ChevronRight, Loader2, Volume2 } from 'lucide-react';

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

// Voice recognition utilities (unchanged)
class VoiceRecognitionService {
  private recognition: any = null;
  private isSupported = false;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.isSupported = true;
    }
  }

  isAvailable() { return this.isSupported; }

  start(onResult: (transcript: string) => void, onError: (error: string) => void, onStart: () => void, onEnd: () => void) {
    if (!this.isSupported) {
      onError('Speech recognition not supported');
      return;
    }
    this.recognition.onstart = onStart;
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim().replace(/[.,!?]+$/, '');
      onResult(transcript);
    };
    this.recognition.onerror = (event: any) => onError(event.error);
    this.recognition.onend = onEnd;
    try { this.recognition.start(); } catch (error) { onError('Failed to start recognition'); }
  }

  stop() { if (this.recognition) this.recognition.stop(); }
}

// Text matching utilities (condensed)
class TextMatcher {
  static normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  static matchText(transcript: string, targetText: string): boolean {
    const normalizedTranscript = this.normalizeText(transcript);
    const normalizedTarget = this.normalizeText(targetText);
    
    if (normalizedTranscript.includes(normalizedTarget) || normalizedTarget.includes(normalizedTranscript)) {
      return true;
    }
    
    const transcriptWords = normalizedTranscript.split(' ').filter(w => w.length > 1);
    const targetWords = normalizedTarget.split(' ').filter(w => w.length > 1);
    
    for (const tWord of transcriptWords) {
      for (const targetWord of targetWords) {
        if (tWord.length > 2 && targetWord.length > 2 && (tWord.includes(targetWord) || targetWord.includes(tWord))) {
          return true;
        }
      }
    }
    return false;
  }

  static matchYear(transcript: string, year: string): boolean {
    const normalized = this.normalizeText(transcript);
    if (normalized.includes(year.toLowerCase())) return true;
    
    const numbers = transcript.match(/\d{4}/g);
    if (numbers?.some(num => year.includes(num))) return true;
    
    const yearMappings: Record<string, string> = {
      'twenty twenty four': '2024', 'twenty twenty three': '2023',
      'twenty twenty five': '2025', 'twenty twenty two': '2022'
    };
    
    return Object.entries(yearMappings).some(([spoken, numeric]) => 
      normalized.includes(spoken) && year.includes(numeric)
    );
  }
}

// Command processor (condensed)
class CommandProcessor {
  static isGlobalCommand(transcript: string): string | null {
    const normalized = TextMatcher.normalizeText(transcript);
    if (normalized.includes('select all') || normalized === 'all') return 'select_all';
    if (normalized.includes('next') || normalized === 'next') return 'next';
    if (normalized.includes('clear') || normalized.includes('reset')) return 'clear';
    return null;
  }

  static findMatches(transcript: string, options: [string, string][], matchByValue = true): [string, string][] {
    return options.filter(([key, value]) => 
      TextMatcher.matchText(transcript, matchByValue ? value : key)
    );
  }

  static findYearMatches(transcript: string, years: string[]): string[] {
    return years.filter(year => TextMatcher.matchYear(transcript, year));
  }
}

export const BubbleSuggestion: React.FC<BubbleSuggestionProps> = ({
  sessionId, onParametersSubmit, disabled = false
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('year');
  const [formData, setFormData] = useState<BubbleSuggestionData>({
    reportSelection: 'Current Version', budgetYear: '', fundCodes: [], departments: []
  });
  const [availableOptions, setAvailableOptions] = useState<{
    years: string[]; fundCodes: [string, string][]; departments: [string, string][];
  }>({ years: [], fundCodes: [], departments: [] });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');

  const voiceServiceRef = useRef<VoiceRecognitionService | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    voiceServiceRef.current = new VoiceRecognitionService();
    return () => { if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current); };
  }, []);

  const showFeedback = useCallback((message: string, isError = false) => {
    if (isError) { setError(message); setVoiceFeedback(''); } 
    else { setVoiceFeedback(message); setError(''); }
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => { setVoiceFeedback(''); setError(''); }, 3000);
  }, []);

  // API calls (simplified)
  const loadBudgetYears = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/budget-years`);
      if (!res.ok) throw new Error('Failed to load budget years');
      const data = await res.json();
      setAvailableOptions(prev => ({ ...prev, years: data.budget_years }));
    } catch (error) { showFeedback('Failed to load budget years', true); }
  }, [showFeedback]);

  const loadFundCodes = useCallback(async (year: string) => {
    if (!year) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/fund-codes?year=${encodeURIComponent(year)}`);
      if (!res.ok) throw new Error('Failed to load fund codes');
      const data = await res.json();
      setAvailableOptions(prev => ({ ...prev, fundCodes: data.fund_codes, departments: [] }));
    } catch (error) { showFeedback('Failed to load fund codes', true); }
    setLoading(false);
  }, [showFeedback]);

  const loadDepartments = useCallback(async (year: string, fundCodes: string[]) => {
    if (!year || fundCodes.length === 0) return;
    setLoading(true);
    try {
      const deptMap = new Map<string, string>();
      for (const code of fundCodes) {
        const res = await fetch(`${API_BASE_URL}/departments?year=${encodeURIComponent(year)}&fund_code=${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          data.departments.forEach(([key, value]: [string, string]) => deptMap.set(key, value));
        }
      }
      setAvailableOptions(prev => ({ ...prev, departments: Array.from(deptMap.entries()) }));
    } catch (error) { showFeedback('Failed to load departments', true); }
    setLoading(false);
  }, [showFeedback]);

  useEffect(() => { loadBudgetYears(); }, [loadBudgetYears]);

  // Handlers (simplified)
  const selectYear = useCallback((year: string) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, budgetYear: year, fundCodes: [], departments: [] }));
  }, [disabled, showFeedback]);

  const toggleFund = useCallback((fundCode: string) => {
    if (disabled) return;
    setFormData(prev => {
      const newFundCodes = prev.fundCodes.includes(fundCode)
        ? prev.fundCodes.filter(c => c !== fundCode)
        : [...prev.fundCodes, fundCode];
      return { ...prev, fundCodes: newFundCodes, departments: [] };
    });
  }, [disabled]);

  const toggleDepartment = useCallback((deptCode: string) => {
    if (disabled) return;
    setFormData(prev => {
      const newDepartments = prev.departments.includes(deptCode)
        ? prev.departments.filter(d => d !== deptCode)
        : [...prev.departments, deptCode];
      return { ...prev, departments: newDepartments };
    });
  }, [disabled]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'year': return formData.budgetYear !== '';
      case 'funds': return formData.fundCodes.length > 0;
      case 'departments': return formData.departments.length > 0;
      default: return false;
    }
  }, [currentStep, formData]);

  const handleNext = useCallback(async () => {
    if (!canProceed() || disabled) return;
    switch (currentStep) {
      case 'year':
        await loadFundCodes(formData.budgetYear);
        setCurrentStep('funds');
        break;
      case 'funds':
        await loadDepartments(formData.budgetYear, formData.fundCodes);
        setCurrentStep('departments');
        break;
      case 'departments':
        setCurrentStep('complete');
        break;
    }
  }, [currentStep, formData, canProceed, disabled, loadFundCodes, loadDepartments]);

  const handleSelectAll = useCallback(() => {
    if (disabled) return;
    switch (currentStep) {
      case 'funds':
        const allFunds = availableOptions.fundCodes.map(([key]) => key);
        setFormData(prev => ({ ...prev, fundCodes: allFunds }));
        break;
      case 'departments':
        const allDepts = availableOptions.departments.map(([key]) => key);
        setFormData(prev => ({ ...prev, departments: allDepts }));
        break;
    }
  }, [currentStep, availableOptions, disabled]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    // Clear all selections and go back to start
    setFormData({
      reportSelection: 'Current Version',
      budgetYear: '',
      fundCodes: [],
      departments: [],
    });
    setCurrentStep('year');
    setAvailableOptions(prev => ({ ...prev, fundCodes: [], departments: [] }));
    showFeedback('Cleared all selections - starting from beginning');
  }, [disabled, showFeedback]);

  // Voice processing (unchanged logic)
  const processVoiceCommand = useCallback((transcript: string) => {
    const globalCommand = CommandProcessor.isGlobalCommand(transcript);
    
    switch (globalCommand) {
      case 'select_all': handleSelectAll(); return;
      case 'next': if (canProceed()) handleNext(); else showFeedback('Cannot proceed. Please make a selection first.'); return;
      case 'clear': handleClear(); return;
    }

    let matchFound = false;
    switch (currentStep) {
      case 'year':
        const yearMatches = CommandProcessor.findYearMatches(transcript, availableOptions.years);
        if (yearMatches.length > 0) { selectYear(yearMatches[0]); matchFound = true; }
        break;
      case 'funds':
        const fundMatches = CommandProcessor.findMatches(transcript, availableOptions.fundCodes, true);
        if (fundMatches.length > 0) {
          fundMatches.forEach(([key]) => toggleFund(key));
          matchFound = true;
        }
        break;
      case 'departments':
        const deptMatches = CommandProcessor.findMatches(transcript, availableOptions.departments, true);
        if (deptMatches.length > 0) {
          deptMatches.forEach(([key]) => toggleDepartment(key));
          matchFound = true;
        }
        break;
    }

    if (!matchFound) showFeedback(`No matches found for "${transcript}"`);
  }, [currentStep, availableOptions, selectYear, toggleFund, toggleDepartment, handleSelectAll, handleNext, handleClear, canProceed, showFeedback]);

  const toggleVoiceRecognition = useCallback(() => {
    const service = voiceServiceRef.current;
    if (isListening) {
      service?.stop();
      setIsListening(false);
    } else {
      if (!service?.isAvailable()) {
        showFeedback('Voice recognition not available', true);
        return;
      }
      service.start(
        processVoiceCommand,
        (error) => { setIsListening(false); showFeedback(`Voice error: ${error}`, true); },
        () => { setIsListening(true); setVoiceFeedback('Listening...'); },
        () => { setIsListening(false); }
      );
    }
  }, [isListening, processVoiceCommand, showFeedback]);

  // Render helpers
  const renderProgressDots = () => {
    const steps = ['year', 'funds', 'departments'];
    const completed = [formData.budgetYear !== '', formData.fundCodes.length > 0, formData.departments.length > 0];
    
    return (
      <div className="flex items-center gap-1">
        {completed.map((isCompleted, index) => (
          <div key={index} className={`w-2 h-2 rounded-full ${
            isCompleted ? 'bg-green-500' : currentStep === steps[index] ? 'bg-blue-500' : 'bg-gray-300'
          }`} />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    if (loading) return <div className="flex items-center gap-1 text-sm text-gray-600"><Loader2 className="w-3 h-3 animate-spin" />Loading...</div>;

    switch (currentStep) {
      case 'year':
        return (
          <div className="flex flex-wrap gap-1">
            {availableOptions.years.slice(0, 6).map(year => (
              <button
                key={year}
                onClick={() => selectYear(year)}
                disabled={disabled}
                className={`px-2 py-1 text-sm font-medium rounded border-2 transition-all ${
                  formData.budgetYear === year
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        );

      case 'funds':
        return (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {availableOptions.fundCodes.slice(0, 8).map(([key, name]) => (
              <button
                key={key}
                onClick={() => toggleFund(key)}
                disabled={disabled}
                className={`px-2 py-1 text-sm rounded border-2 transition-all ${
                  formData.fundCodes.includes(key)
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
                title={name}
              >
                {name.length > 12 ? `${name.substring(0, 12)}...` : name}
              </button>
            ))}
            {availableOptions.fundCodes.length > 8 && (
              <div className="text-sm text-gray-500 px-2 py-1">+{availableOptions.fundCodes.length - 8}</div>
            )}
          </div>
        );

      case 'departments':
        return (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {availableOptions.departments.slice(0, 8).map(([key, name]) => (
              <button
                key={key}
                onClick={() => toggleDepartment(key)}
                disabled={disabled}
                className={`px-2 py-1 text-sm rounded border-2 transition-all ${
                  formData.departments.includes(key)
                    ? 'bg-purple-100 border-purple-400 text-purple-700'
                    : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
                title={name}
              >
                {name.length > 12 ? `${name.substring(0, 12)}...` : name}
              </button>
            ))}
            {availableOptions.departments.length > 8 && (
              <div className="text-sm text-gray-500 px-2 py-1">+{availableOptions.departments.length - 8}</div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">Ready to generate report</span>
          </div>
        );
      default: return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'year': return 'Year';
      case 'funds': return 'Funds';
      case 'departments': return 'Departments';
      case 'complete': return 'Ready';
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded shadow-sm">
      {/* Feedback bar */}
      {(voiceFeedback || error) && (
        <div className={`px-2 py-0.5 text-sm ${error ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          {error || voiceFeedback}
        </div>
      )}
      
      {/* Main content - horizontal layout */}
      <div className="p-2">
        <div className="flex items-center gap-3">
          {/* Progress & Title */}
          <div className="flex items-center gap-2">
            {renderProgressDots()}
            <span className="text-sm font-medium text-gray-700">{getStepTitle()}</span>
          </div>

          {/* Step Content */}
          <div className="flex-1 min-w-0">
            {renderStepContent()}
          </div>
        </div>

        {/* Selected items summary */}
        {(formData.budgetYear || formData.fundCodes.length > 0 || formData.departments.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
            {formData.budgetYear && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded-full">
                {formData.budgetYear}
                {!disabled && (
                  <X className="w-3 h-3 cursor-pointer hover:bg-blue-200 rounded-full p-0.5" 
                     onClick={() => setFormData(prev => ({...prev, budgetYear: ''}))} />
                )}
              </span>
            )}
            {formData.fundCodes.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-sm rounded-full">
                {formData.fundCodes.length} fund{formData.fundCodes.length > 1 ? 's' : ''}
              </span>
            )}
            {formData.departments.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-sm rounded-full">
                {formData.departments.length} dept{formData.departments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons - Always at the bottom */}
      <div className="px-2 pb-2">
        <div className="flex justify-start gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={toggleVoiceRecognition}
            disabled={disabled}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors ${
              isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Voice Command"
          >
            {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            {isListening ? 'Stop' : 'Voice'}
          </button>

          <button
            onClick={handleClear}
            disabled={disabled}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>

          {(currentStep === 'funds' || currentStep === 'departments') && (
            <button
              onClick={handleSelectAll}
              disabled={disabled}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              <Check className="w-3 h-3" />
              All
            </button>
          )}

          {canProceed() && currentStep !== 'complete' && (
            <button
              onClick={handleNext}
              disabled={disabled || loading}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Next'}
              {!loading && <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {currentStep === 'complete' && (
            <button
              onClick={() => onParametersSubmit(formData)}
              disabled={disabled}
              className="flex items-center gap-1 px-4 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
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