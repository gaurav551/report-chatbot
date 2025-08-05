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

    const toggleExpanded = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div
        className={`bg-gray-50 py-8 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4">
          <div className="space-y-8">
            {/* Expandable Advance Analysis Button */}
            <div className="relative">
              <button className="w-full p-6 flex flex-col items-start text-left bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:from-blue-500/30 hover:to-purple-500/30 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                <div className="w-full flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    Advanced Analysis
                  </span>
                  <div
                    className={`transition-transform duration-300 ${
                      !isExpanded ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-700" />
                  </div>
                </div>

                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={isExpanded}
                    onChange={toggleExpanded}
                    className="mr-2"
                  />
                  <label className="text-xs text-gray-500">Full Report</label>
                </div>
              </button>
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
