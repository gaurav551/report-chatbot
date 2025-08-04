import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CompactYearCarousel = ({ 
  value, 
  onChange, 
  years = [], 
  disabled = false, 
  loading = false,
  className = '',
  placeholder = ' Year'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  // Find current index
  const currentIndex = years.findIndex(year => year === value);
  const isValidIndex = currentIndex >= 0;

  const slideToIndex = (newIndex) => {
    if (isAnimating || newIndex < 0 || newIndex >= years.length) return;
    
    setIsAnimating(true);
    onChange(years[newIndex]);
    
    setTimeout(() => setIsAnimating(false), 200);
  };

  const slideLeft = () => {
    if (currentIndex > 0) slideToIndex(currentIndex - 1);
  };

  const slideRight = () => {
    if (currentIndex < years.length - 1) slideToIndex(currentIndex + 1);
  };

  // Touch handling
  const handleTouchStart = (e) => {
    if (disabled || loading) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    
    if (Math.abs(distance) > 30) {
      if (distance > 0) slideRight();
      else slideLeft();
    }
    setTouchStart(null);
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg ${className}`}>
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }
  useEffect(() => {
    // Reset animation state when value changes
     onChange(new Date().getFullYear().toString())
  }, []);

  return (
    <div className={` items-center ${className}`}>
      <div 
        className={`
          relative inline-flex items-center bg-white border border-gray-200 rounded-lg shadow-sm
          ${disabled ? 'opacity-50' : 'hover:shadow-md'}
          transition-shadow duration-200
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Arrow */}
        <button
          onClick={slideLeft}
          disabled={disabled || isAnimating || currentIndex <= 0}
          className={`
            p-1.5 hover:bg-gray-50 transition-colors duration-150 rounded-l-lg
            ${currentIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
          type="button"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>

        {/* Current Year Display */}
        <div className="relative w-20 h-8 overflow-hidden flex items-center justify-center border-x border-gray-100">
          <div 
            className={`
              px-2 py-1 text-sm font-medium rounded transition-all duration-200
              ${isValidIndex
                ? 'text-blue-600 bg-blue-50 transform scale-100'
                : 'text-gray-500 transform scale-95'
              }
              ${isAnimating ? 'animate-pulse' : ''}
            `}
          >
            {isValidIndex ? value : placeholder}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={slideRight}
          disabled={disabled || isAnimating || currentIndex >= years.length - 1}
          className={`
            p-1.5 hover:bg-gray-50 transition-colors duration-150 rounded-r-lg
            ${currentIndex >= years.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
          type="button"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>

        {/* Mini Progress Indicator */}
        {years.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {years.map((_, index) => (
              <div
                key={index}
                className={`
                  w-1 h-1 rounded-full transition-colors duration-150
                  ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default CompactYearCarousel;