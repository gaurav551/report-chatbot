import { ChevronDown, X } from "lucide-react";
import React, { useState, useEffect } from 'react';

interface MultiSelectDropdownProps {
  label: string;
  value: string[];
  options: string[];
  loading: boolean;
  disabled: boolean;
  placeholder: string;
  onChange: (value: string, isSelected: boolean) => void;
  color: 'blue' | 'green';
  showSelectAll?: boolean;
  selectAllValue?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  value,
  options,
  loading,
  disabled,
  placeholder,
  onChange,
  color,
  showSelectAll = false,
  selectAllValue = 'ALL'
}) => {
  const [isOpen, setIsOpen] = useState(false);
 
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 hover:text-blue-600',
    green: 'bg-green-100 text-green-800 hover:text-green-600'
  };

  const handleRemove = (item: string) => {
    onChange(item, false);
  };

  // Filter out the selectAllValue from regular options for display
  const regularOptions = options.filter(option => option !== selectAllValue);
  
  // Check if all regular options are selected
  const isAllSelected = showSelectAll && regularOptions.length > 0 && 
    regularOptions.every(option => value.includes(option));

  const handleSelectAllChange = (isChecked: boolean) => {
    onChange(selectAllValue, isChecked);
  };

  return (
    <div className="relative">
      {/* {label &&
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      } */}
      <div
        className={`w-full p-1 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">
          {loading ? `Loading ${label.toLowerCase()}...` : value.length === 0 ? placeholder : `${value.length} selected`}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
     
      {isOpen && !disabled && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 || (showSelectAll && regularOptions.length === 0) ? (
            <div className="px-3 py-2 text-gray-500">No {label.toLowerCase()} available</div>
          ) : (
            <>
              {/* Select All Option */}
              {showSelectAll && regularOptions.length > 0 && (
                <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="font-medium text-blue-600">Select All</span>
                </label>
              )}
              
              {/* Regular Options */}
              {regularOptions.map(option => (
                <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={(e) => onChange(option, e.target.checked)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </>
          )}
        </div>
      )}
     
      {/* Selected items display */}
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map(item => (
          <span key={item} className={`inline-flex items-center px-2 py-1 text-sm rounded-full ${colorClasses[color]}`}>
            {label === 'Fund Codes' ? 'Fund: ' : 'Dept: '}{item}
            <X
              className="w-3 h-3 ml-1 cursor-pointer"
              onClick={() => handleRemove(item)}
            />
          </span>
        ))}
      </div>
    </div>
  );
};