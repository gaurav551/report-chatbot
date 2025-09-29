import React from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';

export const CommonTooltip = ({ active, payload, label, showMetadata = false }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white p-4 border rounded shadow-lg max-w-xs">
      <p className="font-medium mb-2">{`Period: ${label}`}</p>
      
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="mb-1">
          {`${entry.name}: ${formatCurrency(entry.value)}`}
        </p>
      ))}
      
      {showMetadata && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
          {data.fundCodes && data.fundCodes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <p className="text-xs">
                <span className="font-semibold text-blue-700">Fund Codes:</span>
                <span className="text-blue-600 ml-1">
                  {data.fundCodes.slice(0, 3).join(', ')}
                  {data.fundCodes.length > 3 ? ` (+${data.fundCodes.length - 3} more)` : ''}
                </span>
              </p>
            </div>
          )}
          
          {data.accounts && data.accounts.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded p-2">
              <p className="text-xs">
                <span className="font-semibold text-purple-700">Accounts:</span>
                <span className="text-purple-600 ml-1">
                  {data.accounts.slice(0, 3).join(', ')}
                  {data.accounts.length > 3 ? ` (+${data.accounts.length - 3} more)` : ''}
                </span>
              </p>
            </div>
          )}

          {data.parentDeptIds && data.parentDeptIds.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
              <p className="text-xs">
                <span className="font-semibold text-emerald-700">Parent Dept IDs:</span>
                <span className="text-emerald-600 ml-1">
                  {data.parentDeptIds.slice(0, 3).join(', ')}
                  {data.parentDeptIds.length > 3 ? ` (+${data.parentDeptIds.length - 3} more)` : ''}
                </span>
              </p>
            </div>
          )}

          {data.departments && data.departments.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2">
              <p className="text-xs">
                <span className="font-semibold text-amber-700">Departments:</span>
                <span className="text-amber-600 ml-1">
                  {data.departments.slice(0, 3).join(', ')}
                  {data.departments.length > 3 ? ` (+${data.departments.length - 3} more)` : ''}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};