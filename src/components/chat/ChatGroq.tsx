import { useEffect, useRef, useState } from "react";
import { ChatSession, Message } from "../../interfaces/Message";
import { Bot, RotateCcw, MessageCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import Groq from "groq-sdk";
const MODEL = "llama3-8b-8192";
// Initialize Groq client
const groq = new Groq({
  apiKey: '',
  dangerouslyAllowBrowser: true,
});

export const ChatGroq: React.FC<{
  session: ChatSession;
  onClearSession: () => void;
}> = ({ session, onClearSession }) => {
  const AVAILABLE_YEARS = ["2021", "2022", "2023", "2024"];
  const AVAILABLE_FUND_CODES = ["FC001", "FC002", "FC003", "FC004"];
  const AVAILABLE_DEPARTMENT_IDS = ["DEPT001", "DEPT002", "DEPT003", "DEPT004"];

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession>(session);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Reset session data and messages when session changes
    setCurrentSession(session);
    setMessages([]);
    setConversationHistory([]);

    // Initial greeting
    const timer = setTimeout(() => {
      addBotMessage(
        `Hello ${
          session.userName
        }! I'm here to help you generate reports. Let's start by collecting some information.\n\nWhat year would you like the report for?\nAvailable years: ${AVAILABLE_YEARS.join(
          ", "
        )}`
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [session.sessionId, session.userName]);

  const addBotMessage = (
    text: string,
    type: "text" | "report" = "text",
    reportUrl?: string
  ) => {
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
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const updateSessionData = (updates: Partial<ChatSession>) => {
    const updatedSession = { ...currentSession, ...updates };
    setCurrentSession(updatedSession);
    return updatedSession;
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
    // Reset session data to initial state
    const resetSession = {
      ...currentSession,
      year: "",
      fundCode: "",
      departmentId: "",
    };
    setCurrentSession(resetSession);

    // Add initial greeting after clearing
    setTimeout(() => {
      addBotMessage(
        `Hello ${
          session.userName
        }! I'm here to help you generate reports. Let's start by collecting some information.\n\nWhat year would you like the report for?\nAvailable years: ${AVAILABLE_YEARS.join(
          ", "
        )}`
      );
    }, 300);
  };

  // Helper functions for parameter extraction and validation
  const getNextMissingParameter = (sessionData: ChatSession) => {
    if (!sessionData.year) return "year";
    if (!sessionData.fundCode) return "fundCode";
    if (!sessionData.departmentId) return "departmentId";
    return null;
  };

  const hasAllParameters = (sessionData: ChatSession) => {
    return sessionData.year && sessionData.fundCode && sessionData.departmentId;
  };

  const extractParameter = (text: string, paramType: string) => {
    const upperText = text.toUpperCase();

    switch (paramType) {
      case "year":
        return AVAILABLE_YEARS.find((year) => upperText.includes(year));
      case "fundCode":
        return AVAILABLE_FUND_CODES.find((code) => upperText.includes(code));
      case "departmentId":
        return AVAILABLE_DEPARTMENT_IDS.find((id) => upperText.includes(id));
      default:
        return null;
    }
  };

  const createSystemPrompt = (sessionData: ChatSession) => {
    const nextParam = getNextMissingParameter(sessionData);
    const allCollected = hasAllParameters(sessionData);

    let prompt = `You are a helpful report generation assistant. Your role is to collect three required parameters from users and then generate reports.

Required parameters:
1. Year: One of [${AVAILABLE_YEARS.join(", ")}]
2. Fund Code: One of [${AVAILABLE_FUND_CODES.join(", ")}]
3. Department ID: One of [${AVAILABLE_DEPARTMENT_IDS.join(", ")}]

Current session state:
- Year: ${sessionData.year || "Not provided"}
- Fund Code: ${sessionData.fundCode || "Not provided"}
- Department ID: ${sessionData.departmentId || "Not provided"}

`;

    if (!allCollected) {
      prompt += `\nNext required parameter: ${nextParam}

Please ask the user for the ${nextParam} and remind them of the available options. Be friendly and conversational. If they provide an invalid option, politely ask them to choose from the available options.`;
    } else {
      prompt += `\nAll parameters have been collected! You can now help generate reports or  follow-up questions about the data.`;
    }

    return prompt;
  };

  const generateReport = async (sessionData: ChatSession) => {
    setIsLoading(true);
    try {
      // Simulate API call to generate CSV
      console.log("Generating CSV with params:", {
        year: sessionData.year,
        fundCode: sessionData.fundCode,
        departmentId: sessionData.departmentId,
        sessionId: sessionData.sessionId,
      });

      // Simulate CSV generation API call
      const csvResponse = await new Promise((resolve) =>
        setTimeout(
          () => resolve({ csvPath: "/tmp/report_" + Date.now() + ".csv" }),
          1000
        )
      );

      const csvPath = (csvResponse as any).csvPath;

      // Simulate Flask API call with CSV path
      const reportResponse = await new Promise((resolve) =>
        setTimeout(() => resolve({ reportUrl: "http://127.0.0.1:5000/" }), 1000)
      );

      const reportUrl = (reportResponse as any).reportUrl;

      addBotMessage(
        "Here's your report based on the provided parameters:",
        "report",
        reportUrl
      );
    } catch (error) {
      addBotMessage(
        "Sorry, there was an error generating your report. Please try again."
      );
      console.error("Report generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroqResponse = async (userInput: string) => {
    try {
      // Try to extract parameters from user input
      const nextParam = getNextMissingParameter(currentSession);
      let updatedSession = { ...currentSession };

      if (nextParam) {
        const extractedValue = extractParameter(userInput, nextParam);
        if (extractedValue) {
          updatedSession = updateSessionData({ [nextParam]: extractedValue });
        }
      }

      // Create dynamic system prompt based on current state
      const systemPrompt = createSystemPrompt(updatedSession);

      // Build messages array with current system prompt
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages to avoid token limits
        { role: "user", content: userInput },
      ];

      const completion = await groq.chat.completions.create({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 150,
        stream: false,
        messages: messages,
      });

      const reply = completion.choices[0].message.content;

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: userInput },
        { role: "assistant", content: reply },
      ]);

      // Add bot response
      addBotMessage(reply || "");

      // Check if all parameters are collected and generate report
      if (
        hasAllParameters(updatedSession) &&
        !hasAllParameters(currentSession)
      ) {
        // All parameters just got collected, generate report
        setTimeout(async () => {
          addBotMessage(`Perfect! I have all the required information:
- Year: ${updatedSession.year}
- Fund Code: ${updatedSession.fundCode}
- Department ID: ${updatedSession.departmentId}

Generating your report now...`);
          await generateReport(updatedSession);
        }, 1000);
      }
    } catch (error) {
      console.error("Groq API Error:", error);
      addBotMessage(
        "Sorry, I encountered an error processing your request. Please try again."
      );
    }
  };

  const handleMessage = async (messageText: string) => {
    addUserMessage(messageText);
    setIsLoading(true);

    await handleGroqResponse(messageText);

    setIsLoading(false);
  };

  return (
    <div className=" bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center ">
      <div className="w-full max-w-5xl h-[100vh]  bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Reporting Agent</h1>
                <p className="text-blue-100 text-sm">
                  Welcome, {session.userName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Clear Chat"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Clear Chat</span>
              </button>
              <button
                onClick={onClearSession}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-400/30"
                title="Clear Session"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">New Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Session Status */}
        {/* <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Session Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentSession.year ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                Year: {currentSession.year || 'Pending'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentSession.fundCode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                Fund: {currentSession.fundCode || 'Pending'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentSession.departmentId ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                Dept: {currentSession.departmentId || 'Pending'}
              </span>
            </div>
            {hasAllParameters(currentSession) && (
              <span className="text-green-600 font-medium">✓ Ready to generate reports</span>
            )}
          </div>
        </div> */}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  Starting AI conversation...
                </p>
                <p className="text-sm">
                  I'll help you generate reports using AI
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  userName=""
                  sessionId=""
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <ChatInput onSendMessage={handleMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};
