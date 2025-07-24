import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import DimensionFilter from './DimensionFilter';
import MeasureFilter from './MeasureFilter';

const AdvanceFilter = ({ onFiltersApplied }) => {
  const [dimensionFilters, setDimensionFilters] = useState({});
  const [measureFilters, setMeasureFilters] = useState({});
  const [isFullReport, setIsFullReport] = useState(true);
   const [dimensionFiltersQuery, setDimensionFiltersQuery] = useState();
  const [measureFiltersQuery, setMeasureFiltersQuery] = useState();
  
  const handleSubmit = () => {
    const filterData = {
      isFullReport,
      dimensionFilters,
      measureFilters,
      timestamp: new Date().toISOString()
    };
    
    console.log('Filter Data:', filterData);
    console.log('Is Full Report:', isFullReport);
    console.log('Dimension Filters:', dimensionFilters);
    console.log('Measure Filters:', measureFilters);
    console.log('Dimension Filters Query:', dimensionFiltersQuery);
    console.log('Measure Filters Query:', measureFiltersQuery);
    if (onFiltersApplied) {
      onFiltersApplied(dimensionFiltersQuery, measureFiltersQuery);
    }
  };

  return (
    <div className={`${!isFullReport ? 'min-h-screen' : ' bg-gray-50 py-8'}`}>
      <div className="px-4">
        <div className="space-y-8">
          {/* Full Report Checkbox */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="fullReport"
                checked={isFullReport}
                onChange={(e) => setIsFullReport(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label 
                htmlFor="fullReport" 
                className="text-sm font-medium w-full cursor-pointer"
              >
                Full Report
              </label>
            </div>
          </div>

          {/* Filter Sections - Hidden when Full Report is selected */}
          {!isFullReport && (
            <div className="space-y-4">
              <DimensionFilter
                filters={dimensionFilters}
                onFiltersChange={setDimensionFilters}
                dimensionFiltersQuery={dimensionFiltersQuery}
                setDimensionFiltersQuery={setDimensionFiltersQuery}
              />
             
              <MeasureFilter
                filters={measureFilters}
                onFiltersChange={setMeasureFilters}
                measureFiltersQuery={measureFiltersQuery}
                setMeasureFiltersQuery={setMeasureFiltersQuery}
              />
            </div>
          )}

          {/* Submit Button */}
         {!isFullReport && <div className="bg-white  rounded-lg shadow-sm">
            <div className="flex justify-start">
              <button
                onClick={handleSubmit}
                className="px-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                <Search className="w-3 h-3" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default AdvanceFilter;