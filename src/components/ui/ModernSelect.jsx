import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check, Loader2 } from 'lucide-react';

const ModernSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  multiple = false, 
  single = false, 
  placeholder = "Select...", 
  loading = false,
  disabled = false,
  color = 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Color variants matching MultiSelectDropdown
  const colorVariants = {
    blue: {
      border: 'border-blue-300 focus-within:border-blue-500',
      ring: 'focus-within:ring-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
      tag: 'bg-blue-100 text-blue-800',
      selected: 'bg-blue-50 text-blue-700'
    },
    green: {
      border: 'border-green-300 focus-within:border-green-500',
      ring: 'focus-within:ring-green-500',
      button: 'bg-green-500 hover:bg-green-600',
      tag: 'bg-green-100 text-green-800',
      selected: 'bg-green-50 text-green-700'
    },
    red: {
      border: 'border-red-300 focus-within:border-red-500',
      ring: 'focus-within:ring-red-500',
      button: 'bg-red-500 hover:bg-red-600',
      tag: 'bg-red-100 text-red-800',
      selected: 'bg-red-50 text-red-700'
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  const filteredOptions = options?.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (single) {
      onChange(optionValue);
      setIsOpen(false);
    } else if (multiple) {
      const newValue = Array.isArray(value) ? value : [];
      if (newValue.includes(optionValue)) {
        onChange(newValue.filter(v => v !== optionValue));
      } else {
        onChange([...newValue, optionValue]);
      }
    }
  };

  const handleSelectAll = () => {
    if (multiple && options) {
      const currentValue = Array.isArray(value) ? value : [];
      const allFilteredCodes = filteredOptions.map(opt => opt.code);
      const allSelected = allFilteredCodes.every(code => currentValue.includes(code));
      
      if (allSelected) {
        // Deselect all filtered options
        const newValue = currentValue.filter(item => !allFilteredCodes.includes(item));
        onChange(newValue);
      } else {
        // Select all filtered options
        const newValue = [...new Set([...currentValue, ...allFilteredCodes])];
        onChange(newValue);
      }
    }
  };

  const handleClearAll = () => {
    if (multiple) {
      onChange([]);
    }
  };

  const removeTag = (optionCodeToRemove) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.filter(item => item !== optionCodeToRemove);
      onChange(newValue);
    }
  };

  const getDisplayValue = () => {
    if (loading) return "Loading...";
    
    if (single) {
      const selected = options?.find(opt => opt.code === value);
      return selected ? selected.label : placeholder;
    } else if (multiple) {
      const selectedCount = Array.isArray(value) ? value.length : 0;
      if (selectedCount === 0) return placeholder;
      if (selectedCount === 1) return options?.find(opt => opt.code === value[0])?.label || placeholder;
      return `${selectedCount} selected`;
    }
    return placeholder;
  };

  const getSelectedItems = () => {
    if (!multiple) return [];
    const currentValue = Array.isArray(value) ? value : [];
    return currentValue.map(code => {
      const option = options?.find(opt => opt.code === code);
      return option || { code, label: code };
    });
  };

  const allFilteredSelected = multiple && filteredOptions.length > 0 && 
    filteredOptions.every(option => (Array.isArray(value) ? value : []).includes(option.code));
  const someFilteredSelected = multiple && 
    filteredOptions.some(option => (Array.isArray(value) ? value : []).includes(option.code));

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Main Dropdown Button - Updated Design */}
        <div
          className={`
            relative w-full min-h-[2.5rem] px-3 py-2 border rounded-md shadow-sm
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'}
            ${colors.border} ${colors.ring}
            focus-within:ring-1 focus-within:ring-opacity-50
            transition-colors duration-200
          `}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${getDisplayValue() === placeholder ? 'text-gray-500' : 'text-gray-900'}`}>
                {getDisplayValue()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
              {multiple && Array.isArray(value) && value.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Dropdown Menu - Updated Design */}
        {isOpen && !disabled && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Search Box */}
            {(multiple || (options && options.length > 5)) && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Select All/Clear All Controls */}
            {multiple && filteredOptions.length > 0 && (
              <div className="border-b border-gray-200">
                <div
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={handleSelectAll}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 ${
                      allFilteredSelected 
                        ? `${colors.button} border-transparent` 
                        : someFilteredSelected 
                        ? `${colors.button} border-transparent opacity-50`
                        : 'border-gray-300'
                    }`}>
                      {(allFilteredSelected || someFilteredSelected) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Select All {searchTerm && `(${filteredOptions.length})`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.code}
                    className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      (single && value === option.code) || (multiple && Array.isArray(value) && value.includes(option.code))
                        ? colors.selected
                        : ''
                    }`}
                    onClick={() => handleSelect(option.code)}
                  >
                    {multiple && (
                      <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 ${
                        Array.isArray(value) && value.includes(option.code)
                          ? `${colors.button} border-transparent` 
                          : 'border-gray-300'
                      }`}>
                        {Array.isArray(value) && value.includes(option.code) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    )}
                    <span className="text-sm text-gray-900 flex-1">{option.label}</span>
                    {single && value === option.code && (
                      <Check size={16} className={colors.button.includes('blue') ? 'text-blue-600' : colors.button.includes('green') ? 'text-green-600' : 'text-red-600'} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Items Tags - Only for Multiple Select */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {getSelectedItems().slice(0, 4).map((item, index) => (
              <div
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.tag}`}
              >
                <span className="mr-1">{item.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeTag(item.code)}
                    className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            {value.length > 4 && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.tag}`}>
                <span>+{value.length - 4} others</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSelect;