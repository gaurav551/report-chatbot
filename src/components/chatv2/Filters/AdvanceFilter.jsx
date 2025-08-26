import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Search, ChevronDown } from "lucide-react";
import DimensionFilter from "./DimensionFilter";
import MeasureFilter from "./MeasureFilter";

const AdvanceFilter = forwardRef(
  ({ onFiltersApplied, isVisible = true }, ref) => {
    const [dimensionFilters, setDimensionFilters] = useState({});
    const [measureFilters, setMeasureFilters] = useState({});
    // Changed default to false (Full Report selected by default)
    const [isExpanded, setIsExpanded] = useState(false);

    // Separate states for revenue and expense queries for dimensions
    const [dimensionFiltersExpQuery, setDimensionFiltersExpQuery] = useState();
    const [dimensionFiltersRevQuery, setDimensionFiltersRevQuery] = useState();

    // Separate states for revenue and expense queries for measures
    const [measureFiltersExpQuery, setMeasureFiltersExpQuery] = useState();
    const [measureFiltersRevQuery, setMeasureFiltersRevQuery] = useState();

    const handleSubmit = () => {
      const filterData = {
        isFullReport: !isExpanded,
        dimensionFilters,
        measureFilters,
        timestamp: new Date().toISOString(),
      };

      console.log("Filter Data:", filterData);
      console.log("Is Full Report:", !isExpanded);
      console.log("Dimension Filters:", dimensionFilters);
      console.log("Measure Filters:", measureFilters);
      console.log("Dimension Filters Exp Query:", dimensionFiltersExpQuery);
      console.log("Dimension Filters Rev Query:", dimensionFiltersRevQuery);
      console.log("Measure Filters Exp Query:", measureFiltersExpQuery);
      console.log("Measure Filters Rev Query:", measureFiltersRevQuery);

      if (onFiltersApplied) {
        onFiltersApplied(
          dimensionFiltersExpQuery,
          measureFiltersExpQuery,
          dimensionFiltersRevQuery,
          measureFiltersRevQuery,
          dimensionFilters,
          measureFilters
        );
        console.log("Filters applied successfully with queries:", {
          dimensionFiltersExpQuery,
          dimensionFiltersRevQuery,
          measureFiltersExpQuery,
          measureFiltersRevQuery,
        });
      }
    };

    // Expose handleSubmit method to parent component
    useImperativeHandle(ref, () => ({
      handleSubmit,
    }));

    const handleReportTypeChange = (reportType) => {
      const newIsExpanded = reportType === 'advanced';
      setIsExpanded(newIsExpanded);
      
      if (newIsExpanded) {
        setTimeout(() => {
          const element = document.querySelector('.report-type-selector');
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
      }
    };

    return (
      <div
        className={`transition-opacity duration-300 bg-gray-50 py-2 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4">
          <div className="space-y-2">
            {/* Radio Button Report Type Selector */}
            <div className="flex items-center justify-start">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 report-type-selector">
                <div className="flex items-center space-x-4">
                  {/* Full Report Radio Button */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value="full"
                      checked={!isExpanded}
                      onChange={() => handleReportTypeChange('full')}
                      className="mr-2 w-3 h-3"
                    />
                    <span className="text-sm font-medium text-gray-600 select-none">
                      Full Report
                    </span>
                  </label>
                  
                  {/* Advanced Analysis Radio Button */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value="advanced"
                      checked={isExpanded}
                      onChange={() => handleReportTypeChange('advanced')}
                      className="mr-2 w-3 h-3"
                    />
                    <span className="text-sm font-medium text-gray-600 select-none">
                      Advanced Analysis
                    </span>
                  </label>
                </div>
                
                {/* Chevron icon - only show when Advanced Analysis is selected */}
                {isExpanded && (
                  <div className="ml-3 pl-3 border-l border-gray-300">
                    <div
                      className={`transition-transform duration-300 cursor-pointer ${
                        !isExpanded ? "rotate-180" : "rotate-0"
                      }`}
                      onClick={() => handleReportTypeChange('full')}
                    >
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Sections - Shown when Advanced Analysis is selected */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isExpanded
                  ? "max-h-[2000px] opacity-100 transform translate-y-0"
                  : "max-h-0 opacity-0 transform -translate-y-4"
              }`}
            >
              {isExpanded && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <DimensionFilter
                    filters={dimensionFilters}
                    onFiltersChange={setDimensionFilters}
                    setDimensionFiltersExpQuery={setDimensionFiltersExpQuery}
                    setDimensionFiltersRevQuery={setDimensionFiltersRevQuery}
                  />

                  <MeasureFilter
                    filters={measureFilters}
                    onFiltersChange={setMeasureFilters}
                    setMeasureFiltersExpQuery={setMeasureFiltersExpQuery}
                    setMeasureFiltersRevQuery={setMeasureFiltersRevQuery}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default AdvanceFilter;