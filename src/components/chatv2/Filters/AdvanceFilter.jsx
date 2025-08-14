import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Search, ChevronDown } from "lucide-react";
import DimensionFilter from "./DimensionFilter";
import MeasureFilter from "./MeasureFilter";

const AdvanceFilter = forwardRef(
  ({ onFiltersApplied, isVisible = true }, ref) => {
    const [dimensionFilters, setDimensionFilters] = useState({});
    const [measureFilters, setMeasureFilters] = useState({});
    const [isExpanded, setIsExpanded] = useState(true);

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

    const toggleExpanded = (e) => {
      e.stopPropagation(); // Prevent event bubbling
      setIsExpanded(!isExpanded);
    };

    return (
      <div
        className={`transition-opacity duration-300 bg-gray-50 py-2 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4">
          <div className="space-y-8">
            {/* Compact Full Report Toggle - always visible and left-aligned */}
            <div className="flex items-center justify-start">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                <input
                  type="checkbox"
                  checked={isExpanded}
                  onChange={toggleExpanded}
                  className="mr-2 w-3 h-3"
                />
                <label 
                  className="text-xs font-medium text-gray-600 cursor-pointer select-none mr-2"
                  onClick={toggleExpanded}
                >
                  Full Report
                </label>
                <div
                  className={`transition-transform duration-300 cursor-pointer ${
                    !isExpanded ? "rotate-180" : "rotate-0"
                  }`}
                  onClick={toggleExpanded}
                >
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </div>



            {/* Filter Sections - Shown when expanded */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                !isExpanded
                  ? "max-h-[2000px] opacity-100 transform translate-y-0"
                  : "max-h-0 opacity-0 transform -translate-y-4"
              }`}
            >
              {!isExpanded && (
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