import React, { useState, useCallback, useRef, useEffect } from 'react';

// Utility function for value formatting
const formatValue = (val) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString();
};

// Parse formatted value back to number
const parseFormattedValue = (formattedVal, min, max) => {
  if (typeof formattedVal === 'number') return Math.max(min, Math.min(max, formattedVal));
  
  const str = formattedVal.toString().toLowerCase();
  let num = parseFloat(str);
  
  if (str.includes('m')) num *= 1000000;
  else if (str.includes('k')) num *= 1000;
  
  return Math.max(min, Math.min(max, num));
};

// Single Value Slider Component
const SingleSlider = ({ min, max, value, onChange, disabled = false, label = "Value" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const sliderRef = useRef(null);
  const inputRef = useRef(null);

  const handleMouseDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    setShowTooltip(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || disabled || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + (max - min) * percentage;
    
    onChange(newValue);
  }, [isDragging, min, max, onChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setShowTooltip(false);
  }, []);

  const handleDoubleClick = () => {
    if (disabled) return;
    setInputMode(true);
    setInputValue(value.toString());
  };

  const handleInputSubmit = () => {
    const newValue = parseFormattedValue(inputValue, min, max);
    onChange(newValue);
    setInputMode(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setInputMode(false);
    }
  };

  const handleTrackClick = (e) => {
    if (disabled || isDragging) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + (max - min) * percentage;
    onChange(newValue);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (inputMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [inputMode]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full px-2 py-1">
      {/* Label */}
      <div className="mb-4">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="text-xs text-gray-500 mt-1">
          Double-click on value to edit directly, or click track to jump to position
        </div>
      </div>

      <div ref={sliderRef} className="relative single-slider cursor-pointer" style={{ height: '24px' }} onClick={handleTrackClick}>
        {/* Track */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full top-1/2 transform -translate-y-1/2"></div>
        
        {/* Active track */}
        <div 
          className="absolute h-2 bg-blue-500 rounded-full top-1/2 transform -translate-y-1/2 transition-all duration-200"
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Thumb */}
        <div
          className={`absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-y-1/2 shadow-lg hover:scale-110 transition-all duration-200 ${
            isDragging ? 'scale-125 shadow-xl' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          style={{ left: `${percentage}%`, top: '50%', marginLeft: '-10px' }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Live tooltip while dragging */}
          {(isDragging || showTooltip) && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              {formatValue(Math.round(value))}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Value labels with inline editing */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex flex-col items-start">
          <span className="text-gray-400 text-xs">Min: {formatValue(min)}</span>
        </div>
        
        <div className="flex flex-col items-center">
          {inputMode ? (
            <input
              ref={inputRef}
              type="number"
               value={inputValue}

              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputSubmit}
              onKeyDown={handleInputKeyDown}
              className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          ) : (
            <span 
              className="text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              onDoubleClick={handleDoubleClick}
            >
                              {Math.round(value).toLocaleString()}

            </span>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs">Max: {formatValue(max)}</span>
        </div>
      </div>

      {/* Current selection summary */}
    

      {/* Progress indicator */}
      
    </div>
  );
};

export default SingleSlider;