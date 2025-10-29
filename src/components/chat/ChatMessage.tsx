// ChatMessage.tsx
import { Bot, User, Maximize2, Minimize2, Download, Copy } from "lucide-react";
import { useState } from "react";
import { Message } from "../../interfaces/Message";
import { ReportBaseUrl } from "../../const/url";
import { ChatTable } from "./ChatTable";
import { UrlText } from "../../utils/urlText";

interface ChatMessageProps {
  message: Message;
  userName: string;
  sessionId: string;
  tableData?: Record<string, any>[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  userName,
  sessionId,
  tableData,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const availableFiles = [
    { filename: 'yourfile.csv', type: 'CSV', displayName: 'CSV Data' },
    { filename: 'department_summary.json', type: 'JSON', displayName: 'JSON Data' },
    { filename: 'department_summary.pdf', type: 'PDF', displayName: 'PDF Report' },
    { filename: 'department_summary.xml', type: 'XML', displayName: 'XML Data' },
    { filename: 'Department_Summary.png', type: 'PNG', displayName: 'Chart Image' },
  ];

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const downloadFile = async (filename: string, fileType: string) => {
    setIsDownloading(filename);
    try {
      const downloadUrl = `${ReportBaseUrl}export/outputs/${userName}/${sessionId}/${filename}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`Failed to download ${fileType}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error downloading ${fileType}:`, error);
      alert(`Failed to download ${fileType}. Please try again.`);
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadTableAsCSV = () => {
    if (!tableData || tableData.length === 0) {
      alert('No data available to download');
      return;
    }

    const headers = Object.keys(tableData[0]);
    const csvContent = [
      headers.join(','),
      ...tableData.map(row =>
        headers
          .map(header => {
            const value = row[header];
            const stringValue = String(value ?? '');
            return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const printTable = () => {
    if (!tableData || tableData.length === 0) {
      alert('No data available to print');
      return;
    }

    setIsPrinting(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the table');
        return;
      }

      const headers = Object.keys(tableData[0]);
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Data Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            .print-date { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 11px;
            }
            th { 
              background-color: #2c3e50; 
              color: white;
              padding: 10px; 
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            td { 
              padding: 8px; 
              border: 1px solid #ddd;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            tr:hover {
              background-color: #f0f0f0;
            }
            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; }
              thead { display: table-header-group; }
            }
          </style>
        </head>
        <body>
          <h1>Data Report</h1>
          <div class="print-date">Generated on: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableData
                .map(
                  row => `
                <tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      console.error('Error printing table:', error);
      alert('Failed to print table. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const renderDownloadButtons = (isCompact = false) => (
    <div className={`flex ${isCompact ? 'space-x-1' : 'space-x-2'} ${isCompact ? 'mt-2' : 'mt-3'}`}>
      {tableData ? (
        <>
          <button
            onClick={printTable}
            disabled={isPrinting}
            className={`${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Print table data"
          >
            <Minimize2 className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>{isPrinting ? 'Printing...' : 'Print'}</span>
          </button>

          <button
            onClick={downloadTableAsCSV}
            className={`${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1`}
            title="Download table as CSV"
          >
            <Download className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>CSV</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={printTable}
            disabled={isPrinting}
            className={`${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Print CSV Data"
          >
            <Minimize2 className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span>{isPrinting ? 'Printing...' : 'Print CSV'}</span>
          </button>

          {availableFiles.map(file => (
            <button
              key={file.filename}
              onClick={() => downloadFile(file.filename, file.type)}
              disabled={isDownloading === file.filename}
              className={`${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed`}
              title={`Download ${file.displayName}`}
            >
              <Download className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
              <span>{isDownloading === file.filename ? 'Downloading...' : file.type}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`${message.type !== 'report' ? 'flex' : ''} ${
          message.isUser ? 'justify-end' : 'justify-start'
        } mb-4`}
      >
        <div
          className={`px-2 py-2 rounded-2xl ${
            message.isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          <div className="flex items-start">
            {!message.isUser && (
              <Bot className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
            )}

            <div className="flex-1">
              {message.type === 'report' && message.reportUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-md">
                      {message.text || 'Report generated successfully!'}
                    </p>
                    <button
                      onClick={toggleFullscreen}
                      className="ml-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                      title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div
                    className={`${
                      isFullscreen
                        ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4'
                        : 'w-full h-[500px] relative'
                    } transition-all`}
                  >
                    <div className={`bg-white rounded-lg border border-gray-200 w-full h-full max-w-7xl mx-auto overflow-hidden flex flex-col`}>
                      {isFullscreen && (
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Report View
                          </h3>
                          <div className="flex items-center space-x-2">
                            {renderDownloadButtons(true)}
                            <button
                              onClick={toggleFullscreen}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Exit fullscreen"
                            >
                              <Minimize2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={message.reportUrl}
                        className="w-full flex-1"
                        title="Report"
                      />
                    </div>

                    {!isFullscreen && (
                      <button
                        onClick={toggleFullscreen}
                        className="absolute top-18 right-4 z-10 
                                    bg-opacity-60 hover:bg-opacity-80 text-black
                                   rounded-lg p-2 transition-all duration-200 ease-in-out
                                   hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                        title="View fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {!isFullscreen && renderDownloadButtons()}
                </div>
              ) : tableData && tableData.length > 0 ? (
                <div className="space-y-3">
                  {message.text && (
                    <p className="text-md whitespace-pre-wrap text-gray-800">{message.text}</p>
                  )}
                  <ChatTable
                    tableData={tableData}
                    onPrint={printTable}
                    onDownloadCSV={downloadTableAsCSV}
                    isPrinting={isPrinting}
                  />
                </div>
              ) : (
                <p className="text-md whitespace-pre-wrap"><UrlText text={message.text} /></p>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {message.isUser && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={copyToClipboard}
                  className="text-blue-200 hover:text-white transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <User className="w-5 h-5 mt-0.5 text-blue-200 flex-shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

