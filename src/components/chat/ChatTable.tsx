// ChatTable.tsx
import { useState } from "react";
import { Download, Printer } from "lucide-react";

interface ChatTableProps {
  tableData: Record<string, any>[];
  onPrint: () => void;
  onDownloadCSV: () => void;
  isPrinting: boolean;
  isCompact?: boolean;
}

export const ChatTable: React.FC<ChatTableProps> = ({
  tableData,
  onPrint,
  onDownloadCSV,
  isPrinting,
  isCompact = false,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  if (!tableData || tableData.length === 0) return null;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!tableData || !sortConfig) return tableData;

    const sorted = [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  };

  const formatValue = (value: any): string => {
    if (value == null) return '';
    if (typeof value === 'number') {
      return value % 1 !== 0 ? value.toFixed(2) : String(value);
    }
    return String(value);
  };

  const sortedData = getSortedData();
  const allHeaders = Object.keys(tableData[0]);
  const headers = allHeaders

  return (
    <div className="space-y-3 bg-white rounded-lg p-4">
      <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {headers.map(header => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    {sortConfig?.key === header && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
              >
                {headers.map(header => (
                  <td
                    key={`${rowIdx}-${header}`}
                    className="px-4 py-2 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
                    title={formatValue(row[header])}
                  >
                    {formatValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
Showing {sortedData.length} result{sortedData.length !== 1 ? 's' : ''} • Click column headers to sort
      </p>

      <div className={`flex ${isCompact ? 'space-x-1' : 'space-x-2'}`}>
        <button
          onClick={onPrint}
          disabled={isPrinting}
          className={`${
            isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          } bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Print table data"
        >
          <Printer className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          <span>{isPrinting ? 'Printing...' : 'Print'}</span>
        </button>

        <button
          onClick={onDownloadCSV}
          className={`${
            isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          } bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1`}
          title="Download table as CSV"
        >
          <Download className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          <span>CSV</span>
        </button>
      </div>
    </div>
  );
};