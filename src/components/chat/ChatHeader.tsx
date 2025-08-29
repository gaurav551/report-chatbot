import React, { useState } from "react";
import { Bot, RotateCcw, MessageCircle, FileText, BarChart3, PanelLeftOpen, PanelRightOpen, Columns3, TrendingUp } from "lucide-react";
import { ChatSession, Message } from "../../interfaces/Message";
import Summary from "../ui/Summary";
import { ChatMain } from "./ChatMain";
import Chart from "../ui/Chart";
import { ChatInterface } from "./ChatInterface";
import { ChatVoice } from "../voice/ChatVoice";
import DraggableButton from "../ui/DraggableButton";
import { ChatLayout } from "../layouts/ChatLayout";


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
  const [selectedVersion, setSelectedVersion] = useState("Budgets-PRO");
  const [messages, setMessages] = useState<Message[]>([]);
  const [reportCount, setReportCount] = useState<number>(0);

  // Panel widths with smoother defaults
  const [leftPanelWidth, setLeftPanelWidth] = useState(20);
  const [rightPanelWidth, setRightPanelWidth] = useState(20);
  const [chatFixedWidth, setChatFixedWidth] = useState(80);
  const [chatResizable, setChatResizable] = useState(false);

  // Master toggle button horizontal drag state
  const [masterToggleX, setMasterToggleX] = useState(50);
  const [isMasterToggleDragging, setIsMasterToggleDragging] = useState(false);
  const [masterToggleDragStart, setMasterToggleDragStart] = useState({ x: 0, startX: 0 });

  // Check if there are any report messages
  const hasReportMessages = messages.some(message => message.type === "report");

  const handleClearChat = () => {
    window.dispatchEvent(new CustomEvent('clearChat'));
  };

  const handleApiSessionIdChange = (sessionId: string) => {
    setApiSessionId(sessionId);
  };

  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVersion(event.target.value);
  };

  const handleMessagesChange = (newMessages: Message[]) => {
    const newReportCount = newMessages.filter(message => message.type === "report").length;
    
    if (newReportCount > reportCount) {
      setReportCount(newReportCount);
      setMessages(newMessages);
    } else {
      setMessages(newMessages);
    }
  };

  const toggleLeftSidebar = () => {
    const newVisible = !leftSidebarVisible;
    setLeftSidebarVisible(newVisible);
    
    if (newVisible && !chatResizable) {
      setChatResizable(true);
    }
  };

  const toggleRightSidebar = () => {
    const newVisible = !rightSidebarVisible;
    setRightSidebarVisible(newVisible);
    
    if (newVisible && !chatResizable) {
      setChatResizable(true);
    }
  };

  const toggleBothSidebars = () => {
    const shouldOpen = !leftSidebarVisible && !rightSidebarVisible;
    setLeftSidebarVisible(shouldOpen);
    setRightSidebarVisible(shouldOpen);
    
    if (shouldOpen) {
      setChatResizable(true);
    }
  };

  // Handle forecasting navigation
  const handleForecastingClick = () => {
    window.open('/forecasting/', '_blank');
  };

  // Master toggle button drag handlers
  const handleMasterToggleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.detail === 1) {
      setIsMasterToggleDragging(true);
      setMasterToggleDragStart({
        x: e.clientX,
        startX: masterToggleX
      });
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  };

  const handleMasterToggleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isMasterToggleDragging) return;
    
    const windowWidth = window.innerWidth;
    const deltaX = e.clientX - masterToggleDragStart.x;
    const deltaXPercent = (deltaX / windowWidth) * 100;
    const newX = Math.max(10, Math.min(90, masterToggleDragStart.startX + deltaXPercent));
    
    setMasterToggleX(newX);
  }, [isMasterToggleDragging, masterToggleDragStart]);

  const handleMasterToggleMouseUp = React.useCallback((e: MouseEvent) => {
    if (isMasterToggleDragging) {
      setIsMasterToggleDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      const deltaX = Math.abs(e.clientX - masterToggleDragStart.x);
      if (deltaX < 5) {
        toggleBothSidebars();
      }
    }
  }, [isMasterToggleDragging, masterToggleDragStart]);

  React.useEffect(() => {
    const throttledMouseMove = (e: MouseEvent) => {
      if (isMasterToggleDragging) {
        requestAnimationFrame(() => handleMasterToggleMouseMove(e));
      }
    };

    const handleMouseUpCombined = (e: MouseEvent) => {
      handleMasterToggleMouseUp(e);
    };

    document.addEventListener('mousemove', throttledMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUpCombined);
    
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('mouseup', handleMouseUpCombined);
    };
  }, [handleMasterToggleMouseMove, handleMasterToggleMouseUp, isMasterToggleDragging]);

  const renderChatComponent = () => {
    switch (selectedVersion) {
      case "Budgets-PRO":
        return (
          <ChatMain 
            session={session}
            onApiSessionIdChange={handleApiSessionIdChange}
            onMessagesChange={handleMessagesChange}
          />
        );
      case "Budgets-Voice":
        return (
          <ChatVoice  
            session={session}
            onApiSessionIdChange={handleApiSessionIdChange}
            onMessagesChange={handleMessagesChange}
          />
        );
      default:
        return (
          <ChatInterface   
            session={session}
            onApiSessionIdChange={handleApiSessionIdChange}
            onMessagesChange={handleMessagesChange}
          />
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {/* Top Control Buttons */}
      {hasReportMessages && (
        <div className="fixed top-4 z-30 flex items-center space-x-3">
          {/* Master Toggle Button - Draggable */}
          <div 
            className="transition-all duration-200"
            style={{ 
              transform: `translateX(${masterToggleX - 50}vw)`
            }}
          >
            <button
              onMouseDown={handleMasterToggleMouseDown}
              className={`
                text-white p-3 rounded-full shadow-lg transition-all duration-300 
                transform hover:scale-110 active:scale-95 relative
                ${isMasterToggleDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}
                ${(leftSidebarVisible || rightSidebarVisible)
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25' 
                  : 'bg-gray-500 hover:bg-indigo-600 shadow-gray-500/25'
                }
              `}
              title="Toggle Both Panels (Drag to move horizontally)"
            >
              <Columns3 className="w-5 h-5" />
              
              <div className={`
                absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white 
                transition-all duration-200
                ${isMasterToggleDragging ? 'bg-yellow-400 opacity-100' : 'bg-white/30 opacity-0 hover:opacity-100'}
              `}>
                <div className="w-full h-full rounded-full bg-white/50" />
              </div>
            </button>
            
            {/* Horizontal movement guidelines */}
            {isMasterToggleDragging && (
              <>
                <div className="fixed top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none" style={{ left: '10%' }} />
                <div className="fixed top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none" style={{ left: '50%' }} />
                <div className="fixed top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none" style={{ left: '90%' }} />
              </>
            )}
          </div>

          {/* Forecasting Button */}
          {/* <button
            onClick={handleForecastingClick}
            className="
              text-white p-3 rounded-full shadow-lg transition-all duration-300 
              transform hover:scale-110 active:scale-95
              bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25
            "
            title="Open Forecasting (New Tab)"
          >
            <TrendingUp className="w-5 h-5" />
          </button> */}
        </div>
      )}

      <ChatLayout
        // Panel visibility and sizing
        leftSidebarVisible={leftSidebarVisible}
        rightSidebarVisible={rightSidebarVisible}
        leftPanelWidth={leftPanelWidth}
        rightPanelWidth={rightPanelWidth}
        chatFixedWidth={chatFixedWidth}
        setLeftPanelWidth={setLeftPanelWidth}
        setRightPanelWidth={setRightPanelWidth}
        
        // State and handlers
        hasReportMessages={hasReportMessages}
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
        
        // Session and API data
        session={session}
        apiSessionId={apiSessionId}
        reportCount={reportCount}
        
        // Header content
        selectedVersion={selectedVersion}
        handleVersionChange={handleVersionChange}
        handleClearChat={handleClearChat}
        onClearSession={onClearSession}
        
        // Chat component
        renderChatComponent={renderChatComponent}
      />
    </div>
  );
};