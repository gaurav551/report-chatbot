import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ChatApiRequest, ChatApiResponse, ChatSession, Message } from "../../interfaces/Message";
import { Bot, RotateCcw, MessageCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ReportBaseUrl } from "../../const/url";
import { detectReportOutput } from "../../utils/detectReport";

const chatApi = async (params: ChatApiRequest): Promise<ChatApiResponse> => {
  const response = await axios.post("https://agentic.aiweaver.ai/chat", params);
  return response.data;
};



export const ChatInterface: React.FC<{
  session: ChatSession;
  onClearSession: () => void;
}> = ({ session, onClearSession }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession>(session);
  const [apiSessionId, setApiSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      // Check if the response contains report outputs
      const reportInfo = detectReportOutput(data.reply, session.userName, data.session_id || apiSessionId);
      
      if (reportInfo && reportInfo.hasReport) {
        addBotMessage('Report generated successfully! You can view it below and download the files.', 'report', reportInfo.reportUrl);
      } else {
        addBotMessage(data.reply);
      }
    },
    onError: (error) => {
      console.error('Chat API error:', error);
      addBotMessage('Sorry, there was an error processing your request. Please try again.');
    }
  });

  const addBotMessage = (text: string, type: 'text' | 'report' = 'text', reportUrl?: string) => {
    //ignore default message, becuase username is already sent
    if(text.trim() === 'Please enter your user ID (default: Guest):') return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date(),
      type,
      reportUrl
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const initializeChat = async () => {
    try {
      // First API call with "Hello"
      const initialResponse = await chatApi({ user_message: "Hello" });
      
      // Set the session ID from the response
      setApiSessionId(initialResponse.session_id);
      addBotMessage(`Hi ${session.userName}! I'm AI Reporting Agent, your AI assistant for generating reports`);

      // Add the initial bot response
      addBotMessage(initialResponse.reply);
      
      // Second API call with session_id and username
      if (initialResponse.session_id) {
        await chatMutation.mutateAsync({
          session_id: initialResponse.session_id,
          user_message: `${session.userName}`
        });
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      addBotMessage('Hello! I encountered an issue connecting to the service. Please try sending a message.');
    }
  };

  useEffect(() => {
    setCurrentSession(session);
    setMessages([]);
    setApiSessionId("");
    
    // Initialize chat with API
    const timer = setTimeout(() => {
      initializeChat();
    }, 500);

    return () => clearTimeout(timer);
  }, [session?.sessionId, session?.userName]);

  const clearChat = () => {
    setMessages([]);
    
  };

  const handleMessage = async (messageText: string) => {
    addUserMessage(messageText);
    
    // Make API call with current session ID and user message
    chatMutation.mutate({
      session_id: apiSessionId || undefined,
      user_message: messageText
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="w-full max-w-5xl h-[100vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Reporting Agent</h1>
                <p className="text-blue-100 text-sm">Welcome, {session?.userName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Clear Chat"
                disabled={chatMutation.isPending}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Clear Chat</span>
              </button>
              <button
                onClick={onClearSession}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-400/30"
                title="Clear Session"
                disabled={chatMutation.isPending}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">New Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Starting conversation...</p>
                <p className="text-sm">I'll help you generate reports</p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  userName={session?.userName}
                  sessionId={apiSessionId}
                />
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          <ChatInput  onSendMessage={handleMessage} disabled={chatMutation.isPending} />
        </div>
      </div>
    </div>
  )
}