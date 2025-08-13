import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ChatApiRequest, ChatApiResponse, ChatSession, Message } from "../../interfaces/Message";
import { Bot, MessageCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { detectReportOutput } from "../../utils/detectReport";

const chatApi = async (params: ChatApiRequest): Promise<ChatApiResponse> => {
  const response = await axios.post("https://agentic.aiweaver.ai/chat", params);
  return response.data;
};

interface ChatInterfaceProps {
  session: ChatSession;
  onApiSessionIdChange: (sessionId: string) => void;
  onMessagesChange: (messages: Message[]) => void; // Add this new prop
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, 
  onApiSessionIdChange,
  onMessagesChange // Add this prop
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession>(session);
  const [apiSessionId, setApiSessionId] = useState<string>("");
  const [chatCleared, setChatCleared] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    // Ignore default message, because username is already sent
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
      addBotMessage(`Hi ${session.userName}! I'm AI Reporting Agent, your AI assistant for generating reports`);

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
    setChatCleared(false);
    
    // Initialize chat with API
    const timer = setTimeout(() => {
      initializeChat();
    }, 500);

    return () => clearTimeout(timer);
  }, [session?.sessionId, session?.userName]);

  const clearChat = () => {
    setMessages([]);
    setChatCleared(true);
  };

  const handleMessage = async (messageText: string) => {
    // Hide the cleared message when user starts typing
    if (chatCleared) {
      setChatCleared(false);
    }

    addUserMessage(messageText);
    
    // Make API call with current session ID and user message
    chatMutation.mutate({
      session_id: apiSessionId || undefined,
      user_message: messageText
    });
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        {chatCleared && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">Chat cleared</p>
              <p className="text-sm">You can continue or start a new conversation</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
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
        <ChatInput 
          onSendMessage={handleMessage} 
          disabled={chatMutation.isPending}
          placeholder="Type your message here..."
        />
      </div>
    </>
  );
};