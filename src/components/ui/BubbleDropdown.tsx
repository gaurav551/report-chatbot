import { useEffect, useRef, useState } from "react";
import { Check, X, ChevronRight, Loader2, ChevronUp, Search } from 'lucide-react';
import { DropdownOption } from "../voice/BubbleSuggestion";


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
  key?: string; // Add key prop to force re-render
}
export const BubbleDropdown: React.FC<BubbleDropdownProps> = ({
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

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Clear search when options change (new step)
  useEffect(() => {
    setSearchTerm('');
  }, [options]);

  // Auto-advance when selections are made
  useEffect(() => {
    if (selectedValues.length > 0 && onAutoNext) {
      const timer = setTimeout(() => {
        onAutoNext();
      }, 1000);
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