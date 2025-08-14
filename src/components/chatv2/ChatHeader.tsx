import React, { useState } from "react";
import { Bot, RotateCcw, MessageCircle, FileText, BarChart3 } from "lucide-react";
import { ChatSession, Message } from "../../interfaces/Message";
import Summary from "../ui/Summary";
import { ChatMain } from "./ChatMain";
import Chart from "../ui/Chart";
import { ChatInterface } from "../chat/ChatInterface";

interface ChatHeaderProps {
  session: ChatSession;
  onClearSession: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  session,
  onClearSession
}) => {
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(false);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
  const [apiSessionId, setApiSessionId] = useState<string>("");
  const [selectedVersion, setSelectedVersion] = useState("New Version Report");
  const [messages, setMessages] = useState<Message[]>([]);
  const [reportCount, setReportCount] = useState<number>(0);

  // Check if there are any report messages
  const hasReportMessages = messages.some(message => message.type === "report");

  const handleClearChat = () => {
    // This will be passed down to ChatMain to handle
    window.dispatchEvent(new CustomEvent('clearChat'));
  };

  const handleApiSessionIdChange = (sessionId: string) => {
    setApiSessionId(sessionId);
  };

  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVersion(event.target.value);
    // Add any additional logic here for when version changes
  };

  const handleMessagesChange = (newMessages: Message[]) => {
    const newReportCount = newMessages.filter(message => message.type === "report").length;
    
    // Only update if there's a new report detected
    if (newReportCount > reportCount) {
      setReportCount(newReportCount);
      // Force re-render of Chart and Summary components by updating messages
      setMessages(newMessages);
    } else {
      // Still update messages for hasReportMessages check, but don't trigger component refresh
      setMessages(newMessages);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl h-[100vh] flex gap-4  relative">
        
        {/* Left Sidebar Toggle Button - Only show if there are report messages */}
        {hasReportMessages && (
          <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10">
            <button
              onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
              title="Toggle Summary"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Left Sidebar - Summary Component */}
        <div className={`transition-all duration-300 ease-in-out ${
          leftSidebarVisible && hasReportMessages ? 'w-80 opacity-100' : 'w-0 opacity-0'
        } flex-shrink-0 overflow-hidden`}>
          {hasReportMessages && (
            <Summary 
              key={`summary-${reportCount}`}
              isVisible={leftSidebarVisible} 
              onToggle={() => setLeftSidebarVisible(!leftSidebarVisible)} 
              userName={session?.userName}
              sessionId={apiSessionId}
            />
          )}
        </div>

        {/* Main Chat Area - Centered with responsive width */}
        <div className="flex-1 flex justify-center">
          <div className={`w-full transition-all duration-300 ease-in-out ${
            leftSidebarVisible && rightSidebarVisible && hasReportMessages
              ? 'max-w-3xl' 
              : (leftSidebarVisible || rightSidebarVisible) && hasReportMessages
                ? 'max-w-4xl' 
                : 'max-w-5xl'
          } bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col`}>
            
            {/* Header Section */}
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
                  <select
                    value={selectedVersion}
                    onChange={handleVersionChange}
                    className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="Current Version" className="bg-blue-600 text-white">Current Version</option>
                    <option value="New Version Report" className="bg-blue-600 text-white">New Version Reports</option>
                  </select>
                  <button
                    onClick={handleClearChat}
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

            {/* ChatMain Component */}
            {selectedVersion === "New Version Report" ? (
              <ChatMain 
                session={session}
                onApiSessionIdChange={handleApiSessionIdChange}
                onMessagesChange={handleMessagesChange}
              />
            ) : (
              <ChatInterface   
                session={session}
                onApiSessionIdChange={handleApiSessionIdChange}
                onMessagesChange={handleMessagesChange}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - Chart Component */}
        <div className={`transition-all duration-300 ease-in-out ${
          leftSidebarVisible && hasReportMessages ? 'w-80 opacity-100' : 'w-0 opacity-0'
        } flex-shrink-0 overflow-hidden`}>
          {hasReportMessages && (
            <Chart 
              key={`chart-${reportCount}`}
              isVisible={leftSidebarVisible} 
              onToggle={() => setLeftSidebarVisible(!leftSidebarVisible)} 
              userName={session?.userName} 
              sessionId={apiSessionId} 
            />
          )}
        </div>

        {/* Right Sidebar Toggle Button - Only show if there are report messages */}
        {hasReportMessages && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
            <button
              onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
              title="Toggle Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};