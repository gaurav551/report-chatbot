import { ReportBaseUrl } from "../const/url";

interface ApiResponse {
  status?: string;
  report?: string;
  reply?: string;
  llm_output?: string;
  meta?: {
    userId: string;
    sessionId: string;
    [key: string]: any;
  };
  data?: Array<{
    text_for_output?: string;
    [key: string]: any;
  }>;
  session_id?: string;
}

interface DetectReportOutputResult {
  hasReport: boolean;
  message: string;
  reportUrl: string | null;
  filename: string | null;
}

export const detectReportOutput = (
  response: ApiResponse | string,
  userName: string,
  sessionId: string
): DetectReportOutputResult => {
  // Extract the message content based on input type
  let messageContent = '';

  // Handle if response is a string (backward compatibility)
  if (typeof response === 'string') {
    messageContent = response;
  }
  // Handle no_data, pass_through, and other statuses with data array
  else if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
    // Check if data contains text_for_output (message response)
    const textItems = response.data
      .map(item => item.text_for_output || '')
      .filter(text => text.trim());
    
    if (textItems.length > 0) {
      messageContent = textItems.join('\n').trim();
    } else {
      // If no text_for_output, it's table data - generate a default message
      messageContent = `Data retrieved successfully. Showing ${response.data.length} record${response.data.length !== 1 ? 's' : ''}.`;
    }
  }
  // Handle standard format with report field
  else if (response?.report) {
    messageContent = response.report;
  }
  // Handle standard format with reply field
  else if (response?.reply) {
    messageContent = response.reply;
  }

  // Check if message contains file outputs
  const hasFileOutputs =
    messageContent?.includes('📂 Files saved:') ||
    messageContent?.includes('📂 Hierarchical Files:') ||
    messageContent?.includes('SQL Output:') ||
    messageContent?.includes('CSV:') ||
    messageContent?.includes('JSON:') ||
    messageContent?.includes('Excel:') ||
    messageContent?.includes('XML:');

  if (!hasFileOutputs || !messageContent) {
    return {
      hasReport: false,
      message: messageContent || 'Processing complete.',
      reportUrl: null,
      filename: null
    };
  }

  // Extract file paths from message
  const filePathRegex = /(?:CSV|JSON|Excel|XML|Chart):\s*([^\n]+)/g;
  const filePaths: string[] = [];
  let match;

  while ((match = filePathRegex.exec(messageContent)) !== null) {
    const path = match[1].trim();
    if (path && path !== 'None' && path !== '0') {
      filePaths.push(path);
    }
  }

  // Generate report URL if files found
  if (filePaths.length > 0) {
    // Prefer CSV files, then any other file type
    const csvFile = filePaths.find(path => path?.includes('.csv'));
    const targetFile = csvFile || filePaths.find(p => p && p !== '0' && p !== 'None');

    if (targetFile) {
      // Extract filename from path (handle both full paths and filenames)
      const filename = targetFile.split('/').pop()?.trim() || 'report.csv';
      
      // Build the report URL
      const reportUrl = `${ReportBaseUrl}load/outputs/${userName}/${sessionId}/${filename}`;

      return {
        hasReport: true,
        message: messageContent,
        reportUrl,
        filename
      };
    }
  }

  return {
    hasReport: false,
    message: messageContent,
    reportUrl: null,
    filename: null
  };
};