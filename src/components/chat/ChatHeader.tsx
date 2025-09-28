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
      

      <ChatLayout
        // Panel visibility and sizing
        leftSidebarVisible={leftSidebarVisible}
        rightSidebarVisible={rightSidebarVisible}
        leftPanelWidth={leftPanelWidth}
        rightPanelWidth={rightPanelWidth}
        chatFixedWidth={chatFixedWidth}
        setLeftPanelWidth={setLeftPanelWidth}
        setRightPanelWidth={setRightPanelWidth}
        toggleBothSidebars={handleMasterToggleMouseDown}
        
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