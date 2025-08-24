import React, { useState } from "react";
import { Bot, RotateCcw, MessageCircle, FileText, BarChart3, PanelLeftOpen, PanelRightOpen, Columns3 } from "lucide-react";
import { ChatSession, Message } from "../../interfaces/Message";
import Summary from "../ui/Summary";
import { ChatMain } from "./ChatMain";
import Chart from "../ui/Chart";
import { ChatInterface } from "../chat/ChatInterface";
import { ChatVoice } from "../voice/ChatVoice";
import DraggableButton from "../ui/DraggableButton";

interface ChatHeaderProps {
  session: ChatSession;
  onClearSession: () => void;
}

// Enhanced resize handle with smoother interactions
const ResizeHandle: React.FC<{
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ onMouseDown, className = "" }) => (
  <div
    className={`
      w-2 bg-gradient-to-b from-gray-200 to-gray-300 
      hover:from-blue-400 hover:to-blue-600 
      cursor-col-resize transition-all duration-200 ease-out
      flex-shrink-0 group relative overflow-hidden
      border-l border-r border-gray-200 hover:border-blue-300
      ${className}
    `}
    onMouseDown={onMouseDown}
  >
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/20 group-hover:to-blue-600/30 transition-all duration-300" />
    
    {/* Grip indicator */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <div className="flex flex-col space-y-0.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-0.5 h-0.5 bg-white rounded-full shadow-sm" />
        ))}
      </div>
    </div>
    
    {/* Hover expansion */}
    <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/10 transition-all duration-200" />
  </div>
);

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
  const [leftPanelWidth, setLeftPanelWidth] = useState(20); // Minimum width
  const [rightPanelWidth, setRightPanelWidth] = useState(20); // Minimum width
  const [chatFixedWidth, setChatFixedWidth] = useState(80); // Fixed width as percentage
  const [chatResizable, setChatResizable] = useState(false); // Whether chat can be resized
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isResizingRef = React.useRef<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Master toggle button horizontal drag state
  const [masterToggleX, setMasterToggleX] = useState(50); // Start at 50% (center)
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

  // Master toggle button drag handlers
  const handleMasterToggleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.detail === 1) { // Single click
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
      
      // Check if this was a click (minimal movement) rather than a drag
      const deltaX = Math.abs(e.clientX - masterToggleDragStart.x);
      if (deltaX < 5) { // Less than 5px movement = click
        toggleBothSidebars();
      }
    }
  }, [isMasterToggleDragging, masterToggleDragStart]);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!containerRef.current || !isResizingRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    if (isResizingRef.current === 'left') {
      const newLeftWidth = Math.max(20, Math.min(45, (mouseX / containerWidth) * 100));
      setLeftPanelWidth(newLeftWidth);
    } else if (isResizingRef.current === 'right') {
      const rightX = containerWidth - mouseX;
      const newRightWidth = Math.max(20, Math.min(45, (rightX / containerWidth) * 100));
      setRightPanelWidth(newRightWidth);
    }
  }, []);

  const handleMouseUp = React.useCallback(() => {
    isResizingRef.current = null;
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.classList.remove('select-none');
  }, []);

  const handleLeftResizeStart = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = 'left';
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.classList.add('select-none');
  }, []);

  const handleRightResizeStart = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = 'right';
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.classList.add('select-none');
  }, []);

  // Enhanced event listeners with better performance
  React.useEffect(() => {
    const throttledMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        requestAnimationFrame(() => handleMouseMove(e));
      }
      if (isMasterToggleDragging) {
        requestAnimationFrame(() => handleMasterToggleMouseMove(e));
      }
    };

    const handleMouseUpCombined = (e: MouseEvent) => {
      handleMouseUp();
      handleMasterToggleMouseUp(e);
    };

    document.addEventListener('mousemove', throttledMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUpCombined);
    
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('mouseup', handleMouseUpCombined);
    };
  }, [handleMouseMove, handleMouseUp, handleMasterToggleMouseMove, handleMasterToggleMouseUp, isDragging, isMasterToggleDragging]);

  // Calculate middle panel width with fixed width behavior
  const calculateChatWidth = () => {
    const bothSidebarsHidden = (!leftSidebarVisible || !hasReportMessages) && (!rightSidebarVisible || !hasReportMessages);
    
    // Always use 80% width when both sidebars are hidden
    if (bothSidebarsHidden) {
      return { width: `${chatFixedWidth}%`, flexGrow: 0, flexShrink: 0 };
    }
    
    // When sidebars are visible, calculate remaining space
    const containerWidth = window.innerWidth;
    const leftPixels = leftSidebarVisible && hasReportMessages ? (containerWidth * leftPanelWidth / 100) : 0;
    const rightPixels = rightSidebarVisible && hasReportMessages ? (containerWidth * rightPanelWidth / 100) : 0;
    const remainingWidth = containerWidth - leftPixels - rightPixels - 32; // 32px for margins
    
    return { width: `${remainingWidth}px`, flexGrow: 1, flexShrink: 1 };
  };

  const toggleLeftSidebar = () => {
    const newVisible = !leftSidebarVisible;
    setLeftSidebarVisible(newVisible);
    
    // Enable chat resizing after first sidebar opens
    if (newVisible && !chatResizable) {
      setChatResizable(true);
    }
  };

  const toggleRightSidebar = () => {
    const newVisible = !rightSidebarVisible;
    setRightSidebarVisible(newVisible);
    
    // Enable chat resizing after first sidebar opens
    if (newVisible && !chatResizable) {
      setChatResizable(true);
    }
  };

  const toggleBothSidebars = () => {
    const shouldOpen = !leftSidebarVisible && !rightSidebarVisible;
    setLeftSidebarVisible(shouldOpen);
    setRightSidebarVisible(shouldOpen);
    
    // Enable chat resizing when opening sidebars
    if (shouldOpen) {
      setChatResizable(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div 
        ref={containerRef}
        className={`w-full h-screen flex relative transition-all duration-300 ${
          isDragging ? 'select-none' : ''
        }`}
      >
        
        {/* Horizontally Draggable Master Toggle Button for Both Sidebars */}
        {hasReportMessages && (
          <div 
            className="fixed top-4 z-30 transition-all duration-200"
            style={{ 
              left: `${masterToggleX}%`, 
              transform: 'translateX(-50%)'
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
              
              {/* Drag indicator */}
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
        )}

        {/* Draggable Left Sidebar Toggle Button */}
        {hasReportMessages && !leftSidebarVisible && (
          <DraggableButton
            onClick={toggleLeftSidebar}
            className={
              leftSidebarVisible 
                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/25' 
                : 'bg-gray-500 hover:bg-green-600 shadow-gray-500/25'
            }
            title="Toggle Summary"
            isActive={leftSidebarVisible}
            side="left"
          >
            <FileText className="w-5 h-5" />
          </DraggableButton>
        )}

        {/* Left Sidebar - Summary Component */}
        {leftSidebarVisible && hasReportMessages && (
          <>
            <div 
              className="flex-shrink-0 h-full transition-all duration-300 ease-out transform"
              style={{ 
                width: `${leftPanelWidth}%`,
                transform: leftSidebarVisible ? 'translateX(0)' : 'translateX(-100%)'
              }}
            >
              <div className="w-full h-full bg-white border-r border-gray-200 shadow-lg overflow-hidden flex flex-col">
                <Summary 
                  key={`summary-${reportCount}`}
                  isVisible={leftSidebarVisible} 
                  onToggle={toggleLeftSidebar}
                  userName={session?.userName}
                  sessionId={apiSessionId}
                />
              </div>
            </div>
            
            {/* Left Resize Handle */}
            <ResizeHandle onMouseDown={handleLeftResizeStart} />
          </>
        )}

        {/* Main Chat Area */}
        <div 
          className={`flex justify-center min-w-0 transition-all duration-300 ease-out h-full mx-auto ${
            (!leftSidebarVisible || !hasReportMessages) && (!rightSidebarVisible || !hasReportMessages) 
              ? 'px-4' // Minimal padding when centered
              : 'px-2' // Original margin when sidebars are visible
          }`}
          style={calculateChatWidth()}
        >
          <div className="w-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
            
            {/* Header Section - Fixed Height */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">AI Reporting Agent</h1>
                    <p className="text-blue-100 text-sm">
                      Welcome, {session?.userName} - {apiSessionId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedVersion}
                    onChange={handleVersionChange}
                    className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="Budgets-NLP" className="bg-blue-600 text-white">Budgets-NLP</option>
                    <option value="Budgets-PRO" className="bg-blue-600 text-white">Budgets-PRO</option>
                    <option value="Budgets-Voice" className="bg-blue-600 text-white">Budgets-Voice</option>

                  </select>
                  <button
                    onClick={handleClearChat}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:shadow-lg"
                    title="Clear Chat"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Clear Chat</span>
                  </button>
                  <button
                    onClick={onClearSession}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-400/30 hover:shadow-lg"
                    title="Clear Session"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-medium">New Session</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ChatMain Component - Preserve original design */}
            <div className="flex-1 overflow-hidden">
              {selectedVersion === "Budgets-PRO" ? (
                <ChatMain 
                  session={session}
                  onApiSessionIdChange={handleApiSessionIdChange}
                  onMessagesChange={handleMessagesChange}
                />
              ) : selectedVersion == "Budgets-Voice" ? (<ChatVoice  session={session}
                  onApiSessionIdChange={handleApiSessionIdChange}
                  onMessagesChange={handleMessagesChange}/>) : (
                <ChatInterface   
                  session={session}
                  onApiSessionIdChange={handleApiSessionIdChange}
                  onMessagesChange={handleMessagesChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Resize Handle and Sidebar */}
        {rightSidebarVisible && hasReportMessages && (
          <>
            {/* Right Resize Handle */}
            <ResizeHandle onMouseDown={handleRightResizeStart} />
            
            {/* Right Sidebar - Chart Component with constrained height */}
            <div 
              className="flex-shrink-0 h-full transition-all duration-300 ease-out transform"
              style={{ 
                width: `${rightPanelWidth}%`,
                transform: rightSidebarVisible ? 'translateX(0)' : 'translateX(100%)'
              }}
            >
              <div className="w-full h-full bg-white border-l border-gray-200 shadow-lg overflow-hidden flex flex-col">
                {/* Chart container with overflow scroll */}
                <div className="flex-1 overflow-auto">
                  <Chart 
                    key={`chart-${reportCount}`}
                    isVisible={rightSidebarVisible} 
                    onToggle={toggleRightSidebar}
                    userName={session?.userName} 
                    sessionId={apiSessionId} 
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Draggable Right Sidebar Toggle Button */}
        {hasReportMessages && !rightSidebarVisible && (
          <DraggableButton
            onClick={toggleRightSidebar}
            className={
              rightSidebarVisible 
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25' 
                : 'bg-gray-500 hover:bg-purple-600 shadow-gray-500/25'
            }
            title="Toggle Analytics"
            isActive={rightSidebarVisible}
            side="right"
          >
            <BarChart3 className="w-5 h-5" />
          </DraggableButton>
        )}
        
        {/* Drag overlay for smoother interactions - No blur */}
        {isDragging && (
          <div className="fixed inset-0 z-40 cursor-col-resize" />
        )}
        
      </div>
    </div>
  );
};