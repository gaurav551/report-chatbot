import { formatCurrency } from "../../../utils/formatCurrency";

export const CustomForecastTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{`Period: ${label}`}</p>
        
        {payload.map((entry, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {formatCurrency(entry.value)}
            </p>
          </div>
        ))}
        
        {/* Show fund codes and accounts if available */}
        {payload[0]?.payload?.fundCodes && payload[0].payload.fundCodes.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Fund Codes:</p>
            <div className="flex flex-wrap gap-1">
              {payload[0].payload.fundCodes.slice(0, 5).map((code, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {code}
                </span>
              ))}
              {payload[0].payload.fundCodes.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{payload[0].payload.fundCodes.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {payload[0]?.payload?.accounts && payload[0].payload.accounts.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Accounts:</p>
            <div className="flex flex-wrap gap-1">
              {payload[0].payload.accounts.slice(0, 3).map((account, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {account}
                </span>
              ))}
              {payload[0].payload.accounts.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{payload[0].payload.accounts.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Show single parent_deptid as received from API */}
        {payload[0]?.payload?.parentDeptId && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Parent Dept ID:</p>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              {payload[0].payload.parentDeptId}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};