import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  ChatApiRequest,
  ChatApiResponse,
  ChatSession,
  Message,
} from "../../interfaces/Message";
import { MessageCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ParameterForm, ParameterFormData } from "./ParameterForm";
import { detectReportOutput } from "../../utils/detectReport";
import AdvanceFilter from "./Filters/AdvanceFilter";
import { generateFilterMessage } from "../../utils/generateFIlterMessage";
import { ReportGenerationRequest } from "../../interfaces/ReportGenerationRequest";

const chatApi = async (params: ChatApiRequest): Promise<ChatApiResponse> => {
  const response = await axios.post("https://agentic.aiweaver.ai/chat", params);
  return response.data;
};

const generateReportApi = async (
  params: ReportGenerationRequest
): Promise<any> => {
  const response = await axios.post(
    "https://agentic.aiweaver.ai/api/rpt2/generate-report",
    params
  );
  return response.data;
};

interface ChatMainProps {
  session: ChatSession;
  onApiSessionIdChange: (sessionId: string) => void;
  onMessagesChange: (messages: Message[]) => void; // Add this new prop
}

export const ChatMain: React.FC<ChatMainProps> = ({ 
  session,
  onApiSessionIdChange,
  onMessagesChange // Add this prop
}) => {
  const advanceFilterRef = useRef(null) as any;

  const [messages, setMessages] = useState<Message[]>([]);
  const [apiSessionId, setApiSessionId] = useState<string>("");
  const [chatCleared, setChatCleared] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string>("");
  const [parametersSubmitted, setParametersSubmitted] = useState(false);
  
  // Store form parameters for report generation
  const [reportParams, setReportParams] = useState<ParameterFormData | null>(
    null
  );
  const [filterParams, setFilterParams] = useState({
    measures_requested_rev: null as string | null,
    dimension_filter_rev: null as string | null,
    measures_filter_rev: null as string | null,
    measures_requested_exp: null as string | null,
    dimension_filter_exp: null as string | null,
    measures_filter_exp: null as string | null,
  });

  const [showParameterForm, setShowParameterForm] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update parent component with messages whenever they change
  useEffect(() => {
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  // Listen for clear chat events from parent
  useEffect(() => {
    const handleClearChat = () => {
      clearChat();
    };

    window.addEventListener('clearChat', handleClearChat);
    return () => {
      window.removeEventListener('clearChat', handleClearChat);
    };
  }, []);

  // Update parent with session ID changes
  useEffect(() => {
    if (apiSessionId) {
      onApiSessionIdChange(apiSessionId);
    }
  }, [apiSessionId, onApiSessionIdChange]);

  const chatMutation = useMutation({
    mutationFn: chatApi,
    onSuccess: (data: ChatApiResponse) => {
      if (data.session_id && data.session_id !== apiSessionId) {
        setApiSessionId(data.session_id);
      }
      console.log("mutation success", data);

      // Check if the response contains report outputs
      const reportInfo = detectReportOutput(
        data.reply,
        session.userName,
        data.session_id || apiSessionId
      );

      if (reportInfo && reportInfo.hasReport) {
        console.log("reportInfo", reportInfo);

        addBotMessage(
          "Report generated successfully! You can view it below and download the files.",
          "report",
          reportInfo.reportUrl
        );
      } else {
        // If no report, just add the text response
        console.log("No report detected, adding text response");

        addBotMessage(data.reply);
      }
    },
    onError: (error) => {
      console.error("Chat API error:", error);
      addBotMessage(
        "Sorry, there was an error processing your request. Please try again."
      );
    },
  });

  const reportGenerationMutation = useMutation({
    mutationFn: generateReportApi,
    onSuccess: (data: any) => {
      console.log("Report generation success", data);

      const reportInfo = detectReportOutput(
        data.report,
        session.userName,
        data.session_id || apiSessionId
      );

      if (reportInfo && reportInfo.hasReport) {
        console.log("reportInfo", reportInfo);

        addBotMessage(
          "Report generated successfully! You can view it below and download the files.",
          "report",
          reportInfo.reportUrl
        );
      } else {
        // If no report, just add the text response
        console.log("No report detected, adding text response");

        addBotMessage(data.reply);
      }
    },
    onError: (error) => {
      console.error("Report generation error:", error);
      addBotMessage(
        "Sorry, there was an error generating the report. Please try again."
      );
    },
  });

  const addBotMessage = (
    text: string,
    type: "text" | "report" = "text",
    reportUrl?: string
  ) => {
    // Ignore default message, because username is already sent
    if (text.trim() === "Please enter your user ID (default: Guest):") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date(),
      type,
      reportUrl,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const initializeChat = async () => {
    setIsInitializing(true);
    setInitError("");

    try {
      // First API call with "Hello"
      const initialResponse = await chatApi({ user_message: "Hello" });

      // Set the session ID from the response
      setApiSessionId(initialResponse.session_id);
      addBotMessage(
        `Hi ${session.userName}! I'm AI Reporting Agent, your AI assistant for generating reports`
      );

      // Add the initial bot response
      addBotMessage(initialResponse.reply);

      // Second API call with session_id and username
      if (initialResponse.session_id) {
        await chatMutation.mutateAsync({
          session_id: initialResponse.session_id,
          user_message: `${session.userName}`,
          report_name: "rpt2",
        });
      }

      setIsInitializing(false);
    } catch (error) {
      console.error("Error initializing chat:", error);
      setInitError(
        "Failed to connect to the AI service. Please try refreshing the page."
      );
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setApiSessionId("");
    setShowParameterForm(true);
    setChatCleared(false);
    setIsInitializing(true);
    setInitError("");
    setParametersSubmitted(false);
    setReportParams(null);
    setFilterParams({
      measures_requested_rev: null,
      dimension_filter_rev: null,
      measures_filter_rev: null,
      measures_requested_exp: null,
      dimension_filter_exp: null,
      measures_filter_exp: null,
    });

    // Initialize chat with API
    const timer = setTimeout(() => {
      initializeChat();
    }, 500);

    return () => clearTimeout(timer);
  }, [session?.sessionId, session?.userName]);

  useEffect(() => {
    localStorage.setItem("session_id", apiSessionId);
    localStorage.setItem("user", session?.userName || "");
  }, [apiSessionId, session?.userName]);

  const clearChat = () => {
    setMessages([]);
    setShowParameterForm(true);
    setChatCleared(true);
    setInitError("");
    setParametersSubmitted(false);
    setReportParams(null);
    setFilterParams({
      measures_requested_rev: null,
      dimension_filter_rev: null,
      measures_filter_rev: null,
      measures_requested_exp: null,
      dimension_filter_exp: null,
      measures_filter_exp: null,
    });
  };

  const handleParametersSubmit = async (params: ParameterFormData) => {
    console.log("Parameters submitted:", params);
    setReportParams(params);
    setParametersSubmitted(true);

    // Generate report with current parameters and filters
    await generateReport(params, filterParams);
  };

  const generateReport = async (
    params: ParameterFormData,
    filters: typeof filterParams
  ) => {
    if (!apiSessionId) {
      console.error("No session ID available");
      addBotMessage(
        "Error: No session ID available. Please refresh and try again."
      );
      return;
    }
    console.log(
      "Generating report with parameters:",
      params,
      "and filters:",
      filters
    );

    const reportRequest: ReportGenerationRequest = {
      budget_years: [params.budgetYear],
      fund_codes: params.fundCodes,
      dept_ids: params.departments,
      sessionId: apiSessionId,
      userId: session.userName,
      report_name: "rpt2",
      measures_requested_rev: filters.measures_requested_rev,
      dimension_filter_rev: filters.dimension_filter_rev,
      measures_filter_rev: filters.measures_filter_rev,
      measures_requested_exp: filters.measures_requested_exp,
      dimension_filter_exp: filters.dimension_filter_exp,
      measures_filter_exp: filters.measures_filter_exp,
    };

    console.log("Generating report with:", reportRequest);

    try {
      await reportGenerationMutation.mutateAsync(reportRequest);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const addFilterMessage = (
    dimensionFiltersExpQuery: any,
    measureFilterExpQuery: any,
    dimensionFiltersRevQuery: any,
    measureFiltersRevQuery: any,
    dimensionFilters: any,
    measureFilters: any
  ) => {
    // Create a message with the filter data
    const filterText = generateFilterMessage(dimensionFilters, measureFilters);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: filterText,
      type: "text",
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    
    // Update filter parameters based on the filters received
    const updatedFilters = {
      measures_requested_rev: null,
      dimension_filter_rev: dimensionFiltersRevQuery || null,
      measures_filter_rev: measureFiltersRevQuery,
      measures_requested_exp: null,
      dimension_filter_exp: dimensionFiltersExpQuery,
      measures_filter_exp: measureFilterExpQuery || null,
    };
    setFilterParams(updatedFilters);
    
    // If parameters have been submitted, regenerate the report with new filters
    if (reportParams && parametersSubmitted) {
      generateReport(reportParams, updatedFilters);
    }
  };

  const handleMessage = async (messageText: string) => {
    if (advanceFilterRef.current) {
      advanceFilterRef.current.handleSubmit();
    }
  };

  return (
    <>
      {/* Parameter Form */}
      {showParameterForm && apiSessionId && (
        <ParameterForm
          sessionId={apiSessionId}
          onParametersSubmit={handleParametersSubmit}
          disabled={
            chatMutation.isPending ||
            reportGenerationMutation.isPending ||
            parametersSubmitted
          }
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-medium">Initializing AI Agent</p>
              <p className="text-sm">Connecting to the service...</p>
            </div>
          </div>
        ) : initError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-500 max-w-md mx-auto px-4">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">
                Connection Error
              </p>
              <p className="text-sm text-gray-600 mb-4">{initError}</p>
              <button
                onClick={() => {
                  setInitError("");
                  initializeChat();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : chatCleared && messages.length == 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">Chat cleared</p>
              <p className="text-sm">You can continue or start a new conversation</p>
            </div>
          </div>
        ) : (
          <div className="px-3 py-4 space-y-4 max-w-none">
            {/* Messages with improved styling */}
            {messages.map((message) => (
              <div key={message.id} className="w-full">
                <ChatMessage
                  key={message.id}
                  message={message}
                  userName={session?.userName}
                  sessionId={apiSessionId}
                />
              </div>
            ))}
            {(chatMutation.isPending ||
              reportGenerationMutation.isPending) && (
              <div className="flex items-center space-x-3 text-gray-500 px-4 py-3 bg-gray-50 rounded-xl max-w-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm font-medium">
                  {reportGenerationMutation.isPending
                    ? "Generating report..."
                    : "AI is thinking..."}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        {messages.length > 0 && messages.some((msg) => msg.type === "report") && (
          <div className="px-2 pb-2">
            <AdvanceFilter
              ref={advanceFilterRef as any}
              key={messages.length}
              onFiltersApplied={addFilterMessage}
            />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-2 py-2">
        <ChatInput
          onSendMessage={handleMessage}
          disabled={
            chatMutation.isPending ||
            reportGenerationMutation.isPending ||
            reportParams === null 
          }
          placeholder="Chat is disabled for now, please set report parameters from selection above"
        />
      </div>
    </>
  );
};