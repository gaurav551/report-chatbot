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

// Range Slider Component
const RangeSlider = ({ min, max, value, onChange, disabled = false, label = "Range" }) => {
  const [isDragging, setIsDragging] = useState(null);
  const [showTooltip, setShowTooltip] = useState({ start: false, end: false });
  const [inputMode, setInputMode] = useState({ start: false, end: false });
  const [inputValues, setInputValues] = useState({ start: '', end: '' });
  const sliderRef = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const handleMouseDown = (thumb) => (e) => {
    if (disabled) return;
    setIsDragging(thumb);
    setShowTooltip({ ...showTooltip, [thumb]: true });
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || disabled || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + (max - min) * percentage;
    
    if (isDragging === 'start') {
      onChange([Math.min(newValue, value[1]), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue, value[0])]);
    }
  }, [isDragging, min, max, value, onChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    setShowTooltip({ start: false, end: false });
  }, []);

  const handleDoubleClick = (thumb) => {
    if (disabled) return;
    setInputMode({ ...inputMode, [thumb]: true });
    setInputValues({
      ...inputValues,
      [thumb]: thumb === 'start' ? value[0].toString() : value[1].toString()
    });
  };

  const handleInputSubmit = (thumb) => {
    const inputValue = parseFormattedValue(inputValues[thumb], min, max);
    
    if (thumb === 'start') {
      onChange([Math.min(inputValue, value[1]), value[1]]);
    } else {
      onChange([value[0], Math.max(inputValue, value[0])]);
    }
    
    setInputMode({ ...inputMode, [thumb]: false });
  };

  const handleInputKeyDown = (thumb) => (e) => {
    if (e.key === 'Enter') {
      handleInputSubmit(thumb);
    } else if (e.key === 'Escape') {
      setInputMode({ ...inputMode, [thumb]: false });
    }
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
    if (inputMode.start && startInputRef.current) {
      startInputRef.current.focus();
      startInputRef.current.select();
    }
    if (inputMode.end && endInputRef.current) {
      endInputRef.current.focus();
      endInputRef.current.select();
    }
  }, [inputMode]);

  const startPercentage = ((value[0] - min) / (max - min)) * 100;
  const endPercentage = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="w-full px-2 py-2">
      {/* Label */}
      <div className="mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="text-xs text-gray-500 mt-1">
          Double-click on values to edit directly
        </div>
      </div>

      <div ref={sliderRef} className="relative range-slider" style={{ height: '24px' }}>
        {/* Track */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full top-1/2 transform -translate-y-1/2"></div>
        
        {/* Active range */}
        <div 
          className="absolute h-2 bg-blue-500 rounded-full top-1/2 transform -translate-y-1/2"
          style={{
            left: `${startPercentage}%`,
            width: `${endPercentage - startPercentage}%`
          }}
        ></div>
        
        {/* Start thumb */}
        <div
          className={`absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-y-1/2 shadow-lg hover:scale-110 transition-all duration-200 ${
            isDragging === 'start' ? 'scale-125 shadow-xl' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          style={{ left: `${startPercentage}%`, top: '50%', marginLeft: '-10px' }}
          onMouseDown={handleMouseDown('start')}
          onDoubleClick={() => handleDoubleClick('start')}
        >
          {/* Live tooltip while dragging */}
          {(isDragging === 'start' || showTooltip.start) && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              {formatValue(Math.round(value[0]))}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
        
        {/* End thumb */}
        <div
          className={`absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-y-1/2 shadow-lg hover:scale-110 transition-all duration-200 ${
            isDragging === 'end' ? 'scale-125 shadow-xl' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          style={{ left: `${endPercentage}%`, top: '50%', marginLeft: '-10px' }}
          onMouseDown={handleMouseDown('end')}
          onDoubleClick={() => handleDoubleClick('end')}
        >
          {/* Live tooltip while dragging */}
          {(isDragging === 'end' || showTooltip.end) && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              {formatValue(Math.round(value[1]))}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Value labels with inline editing */}
      <div className="flex justify-between mt-4">
        <div className="flex flex-col items-start">
          {inputMode.start ? (
            <input
              ref={startInputRef}
              type="number"
  value={Math.round(inputValues.start) || inputValues.start}
              onChange={(e) => setInputValues({ ...inputValues, start: e.target.value })}
              onBlur={() => handleInputSubmit('start')}
              onKeyDown={handleInputKeyDown('start')}
              className="w-35 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span 
              className="text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
              onDoubleClick={() => handleDoubleClick('start')}
            >
                {Math.round(value[0]).toLocaleString()}
            </span>
          )}
          <span className="text-gray-400 text-xs mt-1">Min: {formatValue(min)}</span>
        </div>
        
        <div className="flex flex-col items-end">
          {inputMode.end ? (
            <input
              ref={endInputRef}
              type="text"
  value={Math.round(inputValues.end) || inputValues.end}
              onChange={(e) => setInputValues({ ...inputValues, end: e.target.value })}
              onBlur={() => handleInputSubmit('end')}
              onKeyDown={handleInputKeyDown('end')}
              className="w-35 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          ) : (
            <span 
              className="text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
              onDoubleClick={() => handleDoubleClick('end')}
            >
                {Math.round(value[1]).toLocaleString()}
            </span>
          )}
          <span className="text-gray-400 text-xs mt-1">Max: {formatValue(max)}</span>
        </div>
      </div>

      {/* Current selection summary */}
     
    </div>
  );
};
export default RangeSlider;