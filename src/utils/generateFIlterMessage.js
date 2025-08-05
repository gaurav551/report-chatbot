// filterMessageUtils.js

/**
 * Formats dimension filters into user-friendly text
 * @param {Object} dimensionFilters - The dimension filters object
 * @returns {string[]} Array of formatted filter strings
 */
const formatDimensionFilters = (dimensionFilters) => {
  const formattedFilters = [];

  Object.entries(dimensionFilters).forEach(([key, filter]) => {
    const displayName = key.charAt(0).toUpperCase() + key.slice(1);
    
    if (filter.type === 'multiple' && filter.values.length > 0) {
      formattedFilters.push(`${displayName}: ${filter.values.length} selected`);
    } else if (filter.type === 'contains' && filter.containsValue.trim()) {
      formattedFilters.push(`${displayName}: contains "${filter.containsValue}"`);
    } else if (filter.type === 'range' && filter.rangeFrom && filter.rangeTo) {
      formattedFilters.push(`${displayName}: ${filter.rangeFrom} - ${filter.rangeTo}`);
    }
  });

  return formattedFilters;
};

/**
 * Formats measure filters into user-friendly text
 * @param {Object} measureFilters - The measure filters object
 * @returns {string[]} Array of formatted filter strings
 */
const formatMeasureFilters = (measureFilters) => {
  const formattedFilters = [];

  Object.entries(measureFilters).forEach(([key, filter]) => {
    // Convert snake_case to Title Case
    const displayName = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    let filterText = '';

    switch (filter.operator) {
      case '=':
        filterText = `${displayName}: equals ${filter.value && filter.value.toLocaleString()}`;
        break;
      case '>':
        if (filter.range && filter.range.length === 2) {
          filterText = `${displayName}: ${filter.range[0].toLocaleString()} - ${filter.range[1].toLocaleString()}`;
        } else if (filter.value) {
          filterText = `${displayName}: > ${filter.value.toLocaleString()}`;
        }
        break;
      case '>=':
        if (filter.range && filter.range.length === 2) {
          filterText = `${displayName}: ${filter.range[0].toLocaleString()} - ${filter.range[1].toLocaleString()}`;
        } else if (filter.value) {
          filterText = `${displayName}: >= ${filter.value.toLocaleString()}`;
        }
        break;
      case '<':
        filterText = `${displayName}: < ${filter.value && filter.value.toLocaleString()}`;
        break;
      case '<=':
        filterText = `${displayName}: <= ${filter.value && filter.value.toLocaleString()}`;
        break;
      default:
        if (filter.value) {
          filterText = `${displayName}: ${filter.value.toLocaleString()}`;
        }
    }

    if (filterText) {
      formattedFilters.push(filterText);
    }
  });

  return formattedFilters;
};

/**
 * Generates a user-friendly filter message
 * @param {Object} dimensionFilters - The dimension filters object
 * @param {Object} measureFilters - The measure filters object
 * @returns {string} Formatted filter message
 */
export const generateFilterMessage = (
  dimensionFilters,
  measureFilters
) => {
  // Check if both filters are empty
  const isDimensionFiltersEmpty = !dimensionFilters || Object.keys(dimensionFilters).length === 0;
  const isMeasureFiltersEmpty = !measureFilters || Object.keys(measureFilters).length === 0;

  if (isDimensionFiltersEmpty && isMeasureFiltersEmpty) {
    return "All";
  }

  let message = "";
  
  // Format dimension filters
  if (!isDimensionFiltersEmpty) {
    const formattedDimensions = formatDimensionFilters(dimensionFilters);
    if (formattedDimensions.length > 0) {
      message += "Selected Dimension Filters:\n";
      formattedDimensions.forEach(filter => {
        message += `• ${filter}\n`;
      });
    }
  }

  // Format measure filters
  if (!isMeasureFiltersEmpty) {
    const formattedMeasures = formatMeasureFilters(measureFilters);
    if (formattedMeasures.length > 0) {
      if (message) message += "\n";
      message += "Selected Measure Filters:\n";
      formattedMeasures.forEach(filter => {
        message += `• ${filter}\n`;
      });
    }
  }

  return message.trim();
};

// Example usage:
/*
const dimensionFilters = {
  node: {
    type: "multiple",
    values: ["M&O", "Others", "Payroll"],
    containsValue: "",
    rangeFrom: "",
    rangeTo: ""
  },
  parent: {
    type: "contains",
    values: [],
    containsValue: "1212",
    rangeFrom: "",
    rangeTo: ""
  },
  dept: {
    type: "range",
    values: [],
    containsValue: "",
    rangeFrom: "0011019",
    rangeTo: "0012059"
  }
};

const measureFilters = {
  budget_amt: {
    operator: "=",
    value: 115934629.33072409
  },
  encumbered_amt: {
    operator: ">",
    range: [80251.19580170525, 470903.5]
  }
};

const message = generateFilterMessage(dimensionFilters, measureFilters);
console.log(message);
*/