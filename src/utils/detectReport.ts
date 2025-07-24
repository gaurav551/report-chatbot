import { ReportBaseUrl } from "../const/url";

export const detectReportOutput = (reply: string, userName: string, sessionId: string) => {
  const hasFileOutputs = reply.includes('📂 Files saved:') || reply.includes('📂 Hierarchical Files:') || reply.includes('SQL Output:');
  
  if (!hasFileOutputs) {
    return null;
  }

  const filePathRegex = /(?:CSV|JSON|Excel|XML|Chart):\s*([^\n]+)/g;
  const filePaths = [] as any;
  let match;
  
  while ((match = filePathRegex.exec(reply)) !== null) {
    filePaths.push(match[1].trim());
  }

  // If we found file paths, generate report URLs
  if (filePaths.length > 0) {
    const csvFile = filePaths.find(path => path?.includes('.csv'));
    const targetFile = csvFile || filePaths[0];
    
    if (targetFile) {
      const filename = 'yourfile.csv';

      const reportUrl = `${ReportBaseUrl}load/outputs/${userName}/${sessionId}/${filename}`;

      return {
        hasReport: true,
        reportUrl,
        filename
      };
    }
  }

  return null;
};