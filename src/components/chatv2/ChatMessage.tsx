import { Bot, User, Maximize2, Minimize2, Download, Printer, Copy } from "lucide-react";
import { useState } from "react";
import { Message } from "../../interfaces/Message";
import { ReportBaseUrl } from "../../const/url";

interface ChatMessageProps {
  message: Message;
  userName: string;
  sessionId: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, userName, sessionId }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

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

  const availableFiles = [
    { filename: 'yourfile.csv', type: 'CSV', displayName: 'CSV Data' },
    { filename: 'department_summary.json', type: 'JSON', displayName: 'JSON Data' },
    { filename: 'department_summary.pdf', type: 'PDF', displayName: 'PDF Report' },
    { filename: 'department_summary.xml', type: 'XML', displayName: 'XML Data' },
    { filename: 'Department_Summary.png', type: 'PNG', displayName: 'Chart Image' }
  ];

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

  const printCSV = async () => {
    setIsPrinting(true);
    try {
      const csvFile = availableFiles.find(file => file.type === 'CSV');
      if (!csvFile) {
        alert('CSV file not available for printing');
        return;
      }

      const downloadUrl = `${ReportBaseUrl}export/outputs/${userName}/${sessionId}/${csvFile.filename}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Failed to fetch CSV file');
      const csvText = await response.text();

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the CSV file');
        return;
      }

      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>CSV Print - ${csvFile.filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-date { color: #666; font-size: 12px; margin-bottom: 20px; }
            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h1>CSV Report: ${csvFile.filename}</h1>
          <div class="print-date">Generated on: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Error printing CSV:', error);
      alert('Failed to print CSV file. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const renderDownloadButtons = (isCompact = false) => (
    <div className={`flex ${isCompact ? 'space-x-1' : 'space-x-2'} ${isCompact ? 'mt-2' : 'mt-3'}`}>
      <button
        onClick={printCSV}
        disabled={isPrinting}
        className={`
          ${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
          bg-purple-600 text-white rounded-md hover:bg-purple-700 
          transition-colors flex items-center space-x-1
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title="Print CSV Data"
      >
        <Printer className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
        <span>{isPrinting ? 'Printing...' : 'Print CSV'}</span>
      </button>

      {availableFiles.map((file) => (
        <button
          key={file.filename}
          onClick={() => downloadFile(file.filename, file.type)}
          disabled={isDownloading === file.filename}
          className={`
            ${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
            bg-green-600 text-white rounded-md hover:bg-green-700 
            transition-colors flex items-center space-x-1
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={`Download ${file.displayName}`}
        >
          <Download className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          <span>{isDownloading === file.filename ? 'Downloading...' : file.type}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className={`${message.type !== 'report' ? 'flex' : ''} ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`px-4 py-2 rounded-2xl ${message.isUser ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
          <div className="flex items-start space-x-2">
            {!message.isUser && <Bot className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />}
            
            <div className="flex-1">
              {message.type === 'report' && message.reportUrl ? (
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <p className="text-md">{message.text || 'Report generated successfully!'}</p>
                    <button
                      onClick={toggleFullscreen}
                      className="ml-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                      title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Iframe container (shared) */}
                  <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4' : 'w-full h-[500px] relative'} transition-all`}>
                    <div className={`bg-white rounded-lg border border-gray-200 w-full h-full max-w-7xl mx-auto overflow-hidden flex flex-col`}>
                      {isFullscreen && (
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                          <h3 className="text-lg font-semibold text-gray-800">Report View</h3>
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
                      <iframe src={message.reportUrl} className="w-full flex-1" title="Report" />
                    </div>

                    {/* Floating fullscreen toggle button - only show when not in fullscreen */}
                    {/* {!isFullscreen && (
                      <button
                        onClick={toggleFullscreen}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 
                                   bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900
                                   shadow-lg hover:shadow-xl border border-gray-200
                                   rounded-full p-3 transition-all duration-200 ease-in-out
                                   hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        title="View fullscreen"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    )} */}
                  </div>

                  {!isFullscreen && renderDownloadButtons()}
                </div>
              ) : (
                <p className="text-md whitespace-pre-wrap">{message.text}</p>
              )}
              <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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