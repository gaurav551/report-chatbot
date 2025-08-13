import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FileText, 
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { ReportBaseUrl, ReportFileName } from '../../const/url';

// Fetch function
const fetchSummaryData = async (summaryUrl) => {
  const response = await axios.get(summaryUrl);
  return response.data;
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Summary = ({ isVisible, onToggle, userName, sessionId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const summaryUrl = `${ReportBaseUrl}charts/outputs/${userName}/${sessionId}/${ReportFileName}`;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['summaryData', userName, sessionId],
    queryFn: () => fetchSummaryData(summaryUrl),
    enabled: isVisible && !!userName && !!sessionId,

  });

  if (!isVisible) return null;

  // Generate summary text
  const getSummaryText = () => {
    if (!data) return null;
    
    const revenue = data.budget_vs_actual?.revenue_comparison;
    const expenses = data.budget_vs_actual?.expense_comparison;
    
    const totalRevenueActual = revenue?.find(r => r.category.includes('Actual'))?.amount || 0;
    const totalExpenseActual = expenses?.find(e => e.category.includes('Actual'))?.amount || 0;
    const netPosition = totalRevenueActual - totalExpenseActual;
    
    const sentence1 = `The organization generated ${formatCurrency(totalRevenueActual)} in total revenue against ${formatCurrency(totalExpenseActual)} in expenses.`;
    const sentence2 = `This results in a ${netPosition >= 0 ? 'surplus' : 'deficit'} of ${formatCurrency(Math.abs(netPosition))}, indicating ${netPosition >= 0 ? 'positive' : 'challenging'} financial performance.`;
    
    return { sentence1, sentence2 };
  };

  const summaryText = getSummaryText();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Report Summary</h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-green-700 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-green-600 mr-2" />
              <span className="text-gray-600">Loading...</span>
            </div>
          )}

          {error && (
                  <div className="h-96 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span>Error loading data: {error.message}</span>
        </div>
      </div>
            
          )}

          {summaryText && (
            <div className="text-sm text-gray-700 leading-relaxed space-y-3">
              <p>{summaryText.sentence1}</p>
              <p>{summaryText.sentence2}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;