
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

const MultiSelectDropdown = ({
  label,
  value = [],
  options = [],
  loading = false,
  disabled = false,
  placeholder = 'Select options',
  onChange,
  color = 'blue',
  showSelectAll = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const colorVariants = {
    blue: {
      border: 'border-blue-300 focus-within:border-blue-500',
      ring: 'focus-within:ring-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
      tag: 'bg-blue-100 text-blue-800',
      checkbox: 'text-blue-600'
    },
    green: {
      border: 'border-green-300 focus-within:border-green-500',
      ring: 'focus-within:ring-green-500',
      button: 'bg-green-500 hover:bg-green-600',
      tag: 'bg-green-100 text-green-800',
      checkbox: 'text-green-600'
    },
    red: {
      border: 'border-red-300 focus-within:border-red-500',
      ring: 'focus-within:ring-red-500',
      button: 'bg-red-500 hover:bg-red-600',
      tag: 'bg-red-100 text-red-800',
      checkbox: 'text-red-600'
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  const filteredOptions = options.filter(([val, label]) =>
    `${val} - ${label}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    console.log('value', options);
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionToggle = (optionVal) => {
    const isSelected = value.includes(optionVal);
    onChange?.(optionVal, !isSelected);
  };

  const handleSelectAll = () => {
    const allSelected = filteredOptions.every(([val]) => value.includes(val));
    onChange?.('ALL', !allSelected);
  };

  const removeTag = (val) => {
    onChange?.(val, false);
  };

  const clearAll = () => {
    value.forEach((v) => onChange?.(v, false));
  };

  const allFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every(([val]) => value.includes(val));
  const someFilteredSelected =
    filteredOptions.some(([val]) => value.includes(val));

  return (
    <div className="w-full">

      <div className="relative" ref={dropdownRef}>
        <div
          className={`
            relative w-full min-h-[1.5rem] px-3 py-1 border rounded-md shadow-sm
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'}
            ${colors.border} ${colors.ring}
            focus-within:ring-1 focus-within:ring-opacity-50
            transition-colors duration-200
          `}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {value.length === 0 ? (
                <span className="text-gray-500 text-sm">{placeholder}</span>
              ) : (
                <span className="text-gray-900 text-sm">{value.length} selected</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
              )}
              {value.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {isOpen && !disabled && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
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

            {/* Select All */}
            {showSelectAll && filteredOptions.length > 0 && (
              <div className="border-b border-gray-200">
                <div
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={handleSelectAll}
                >
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
            )}

            {/* Options */}
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map(([val, label], index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOptionToggle(val)}
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center mr-3 ${
                      value.includes(val)
                        ? `${colors.button} border-transparent`
                        : 'border-gray-300'
                    }`}>
                      {value.includes(val) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900">{val} - {label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 4).map((val, index) => {
              const option = options.find(([code]) => code === val);
              const displayLabel = option ? `${option[0]} - ${option[1]}` : val;
              return (
                <div
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.tag}`}
                >
                  <span className="mr-1">{displayLabel}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeTag(val)}
                      className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
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
export default MultiSelectDropdown;
