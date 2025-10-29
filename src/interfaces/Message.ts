export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "report";
  reportUrl?: string;
  tableData?: Record<string, any>[]; // Add this line
}

export interface ChatSession {
  userName: string;
  userId : string;
  year?: string;
  fundCode?: string;
  departmentId?: string;
  sessionId: string;
}
export interface ChatApiRequest {
  session_id?: string;
  user_message: string;
  report_name?: string;
}

export interface ChatApiResponse {
  session_id: string;
  reply: string;
  completed: boolean;
}