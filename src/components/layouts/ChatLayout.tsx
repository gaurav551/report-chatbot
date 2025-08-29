import React from "react";
import { Bot, RotateCcw, MessageCircle, FileText, BarChart3 } from "lucide-react";
import { ChatSession } from "../../interfaces/Message";
import Summary from "../ui/Summary";
import Chart from "../ui/Chart";
import DraggableButton from "../ui/DraggableButton";

interface ChatLayoutProps {
  // Panel visibility and sizing
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  chatFixedWidth: number;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  
  // State and handlers
  hasReportMessages: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  
  // Session and API data
  session: ChatSession;
  apiSessionId: string;
  reportCount: number;
  
  // Header content
  selectedVersion: string;
  handleVersionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClearChat: () => void;
  onClearSession: () => void;
  
  // Chat component
  renderChatComponent: () => React.ReactNode;
}

// Enhanced resize handle component
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
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/20 group-hover:to-blue-600/30 transition-all duration-300" />
    
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <div className="flex flex-col space-y-0.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-0.5 h-0.5 bg-white rounded-full shadow-sm" />
        ))}
      </div>
    </div>
    
    <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/10 transition-all duration-200" />
  </div>
);

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  leftSidebarVisible,
  rightSidebarVisible,
  leftPanelWidth,
  rightPanelWidth,
  chatFixedWidth,
  setLeftPanelWidth,
  setRightPanelWidth,
  hasReportMessages,
  toggleLeftSidebar,
  toggleRightSidebar,
  session,
  apiSessionId,
  reportCount,
  selectedVersion,
  handleVersionChange,
  handleClearChat,
  onClearSession,
  renderChatComponent
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isResizingRef = React.useRef<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

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
  }, [setLeftPanelWidth, setRightPanelWidth]);

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

  React.useEffect(() => {
    const throttledMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        requestAnimationFrame(() => handleMouseMove(e));
      }
    };

    document.addEventListener('mousemove', throttledMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isDragging]);

  // Calculate middle panel width with fixed width behavior
  const calculateChatWidth = () => {
    const bothSidebarsHidden = (!leftSidebarVisible || !hasReportMessages) && (!rightSidebarVisible || !hasReportMessages);
    
    if (bothSidebarsHidden) {
      return { width: `${chatFixedWidth}%`, flexGrow: 0, flexShrink: 0 };
    }
    
    const containerWidth = window.innerWidth;
    const leftPixels = leftSidebarVisible && hasReportMessages ? (containerWidth * leftPanelWidth / 100) : 0;
    const rightPixels = rightSidebarVisible && hasReportMessages ? (containerWidth * rightPanelWidth / 100) : 0;
    const remainingWidth = containerWidth - leftPixels - rightPixels - 32;
    
    return { width: `${remainingWidth}px`, flexGrow: 1, flexShrink: 1 };
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-screen flex relative transition-all duration-300 ${
        isDragging ? 'select-none' : ''
      }`}
    >
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
            ? 'px-4'
            : 'px-2'
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

          {/* Chat Component - Preserve original design */}
          <div className="flex-1 overflow-hidden">
            {renderChatComponent()}
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
      
      {/* Drag overlay for smoother interactions */}
      {isDragging && (
        <div className="fixed inset-0 z-40 cursor-col-resize" />
      )}
    </div>
  );
};