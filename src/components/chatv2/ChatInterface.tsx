import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  ChatApiRequest,
  ChatApiResponse,
  ChatSession,
  Message,
} from "../../interfaces/Message";
import { Bot, RotateCcw, MessageCircle, Send, BarChart3, FileText } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ParameterForm, ParameterFormData } from "./ParameterForm";
import { detectReportOutput } from "../../utils/detectReport";
import FilterComponent from "./Filters/DimensionFilter";
import AdvanceFilter from "./Filters/AdvanceFilter";
import { generateFilterMessage } from "../../utils/generateFIlterMessage";
import Chart from "../ui/Chart";
import Summary from "../ui/Summary";

// New interface for the report generation API
interface ReportGenerationRequest {
  budget_years: string[];
  fund_codes: string[];
  dept_ids: string[];
  sessionId: string;
  userId: string;
  report_name: string;
  measures_requested_rev: string | null;
  dimension_filter_rev: string | null;
  measures_filter_rev: string | null;
  measures_requested_exp: string | null;
  dimension_filter_exp: string | null;
  measures_filter_exp: string | null;
}

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

export const ChatInterface: React.FC<{
  session: ChatSession;
  onClearSession: () => void;
}> = ({ session, onClearSession }) => {
  const advanceFilterRef = useRef(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [apiSessionId, setApiSessionId] = useState<string>("");
  const [chatCleared, setChatCleared] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string>("");
  const [parametersSubmitted, setParametersSubmitted] = useState(false);
const [leftSidebarVisible, setLeftSidebarVisible] = useState(false);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
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

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      type: "text",
      isUser: true,
      timestamp: new Date(),
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
    // You'll need to map dimensionFiltersQuery and measureFiltersQuery to the appropriate filter fields
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
    // Hide the cleared message when user starts typing
    // if (chatCleared) {
    //   setChatCleared(false);
    // }

    // addUserMessage(messageText);
    if (advanceFilterRef.current) {
      advanceFilterRef.current.handleSubmit();
    }

    // try {
    //   await chatMutation.mutateAsync({
    //     session_id: apiSessionId,
    //     user_message: messageText,
    //     report_name: "rpt2",
    //   });
    // } catch (error) {
    //   console.error("Error sending message:", error);
    // }
  };

return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl h-[100vh] flex gap-4 p-4 relative">
        
        {/* Left Sidebar Toggle Button */}
       {true && <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Toggle Summary"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>}

        {/* Left Sidebar - Summary Component */}
        <div className={`transition-all duration-300 ease-in-out ${
          leftSidebarVisible ? 'w-80 opacity-100' : 'w-0 opacity-0'
        } flex-shrink-0 overflow-hidden`}>
          <Summary isVisible={leftSidebarVisible} onToggle={() => setLeftSidebarVisible(!leftSidebarVisible)} userName={session?.userName}
                        sessionId={apiSessionId}/>
        </div>

        {/* Main Chat Area - Centered with responsive width */}
        <div className="flex-1 flex justify-center ">
          <div className={`w-full transition-all duration-300 ease-in-out ${
            leftSidebarVisible && rightSidebarVisible 
              ? 'max-w-3xl' 
              : leftSidebarVisible || rightSidebarVisible 
                ? 'max-w-4xl' 
                : 'max-w-5xl'
          } bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">AI Reporting Agent</h1>
                    <p className="text-blue-100 text-sm">
                      Welcome, {session?.userName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearChat}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                    title="Clear Chat"
                    disabled={
                      chatMutation.isPending ||
                      reportGenerationMutation.isPending ||
                      isInitializing
                    }
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Clear Chat</span>
                  </button>
                  <button
                    onClick={onClearSession}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-400/30"
                    title="Clear Session"
                    disabled={
                      chatMutation.isPending ||
                      reportGenerationMutation.isPending ||
                      isInitializing
                    }
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-medium">New Session</span>
                  </button>
                </div>
              </div>
            </div>

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
                <div className="px-6 py-4 space-y-4 max-w-none">
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
                <div className="px-6 pb-4">
                  <AdvanceFilter
                    ref={advanceFilterRef as any}
                    key={messages.length}
                    onFiltersApplied={addFilterMessage}
                  />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
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
          </div>
        </div>

        {/* Right Sidebar - Chart Component */}
        <div className={`transition-all duration-300 ease-in-out ${
          rightSidebarVisible ? 'w-80 opacity-100' : 'w-0 opacity-0'
        } flex-shrink-0 overflow-hidden`}>
          <Chart isVisible={rightSidebarVisible} onToggle={() => setRightSidebarVisible(!rightSidebarVisible)} key={messages.length} userName={session?.userName} sessionId={apiSessionId} />
        </div>

        {/* Right Sidebar Toggle Button */}
       {true && <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Toggle Analytics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>}
        
      </div>
    </div>
  );
};

