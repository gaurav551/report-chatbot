import React, { useState } from "react";

// Draggable Button Component
const DraggableButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className: string;
  title: string;
  isActive: boolean;
  side: 'left' | 'right' | 'center';
  allowHorizontal?: boolean;
}> = ({ children, onClick, className, title, isActive, side, allowHorizontal = false }) => {
  const [position, setPosition] = useState({ y: 50, x: 50 }); // Start at center
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, startY: 0, x: 0, startX: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.detail === 1) { // Single click
      setIsDragging(true);
      setDragStart({
        y: e.clientY,
        startY: position.y,
        x: e.clientX,
        startX: position.x
      });
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Vertical movement (always allowed)
    const deltaY = e.clientY - dragStart.y;
    const deltaYPercent = (deltaY / windowHeight) * 100;
    const newY = Math.max(10, Math.min(90, dragStart.startY + deltaYPercent));
    
    // Horizontal movement (only if allowHorizontal is true)
    let newX = position.x;
    if (allowHorizontal) {
      const deltaX = e.clientX - dragStart.x;
      const deltaXPercent = (deltaX / windowWidth) * 100;
      newX = Math.max(10, Math.min(90, dragStart.startX + deltaXPercent));
    }
    
    setPosition({ y: newY, x: newX });
  }, [isDragging, dragStart, allowHorizontal, position.x]);

  const handleMouseUp = React.useCallback((e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Check if this was a click (minimal movement) rather than a drag
      const deltaY = Math.abs(e.clientY - dragStart.y);
      const deltaX = Math.abs(e.clientX - dragStart.x);
      const totalMovement = Math.sqrt(deltaY * deltaY + deltaX * deltaX);
      
      if (totalMovement < 5) { // Less than 5px movement = click
        onClick();
      }
    }
  }, [isDragging, dragStart, onClick]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Determine positioning based on side prop
  const getPositionClasses = () => {
    if (allowHorizontal) {
      // For horizontally draggable buttons, position is controlled by inline styles
      return '';
    }
    
    switch (side) {
      case 'left':
        return 'left-4';
      case 'right':
        return 'right-4';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      default:
        return 'left-4';
    }
  };

  const getInlineStyles = () => {
    if (allowHorizontal) {
      // For horizontally draggable buttons, use absolute positioning
      return {
        top: `${position.y}%`,
        left: `${position.x}%`,
        transform: 'translate(-50%, -50%)'
      };
    } else {
      // Original vertical-only positioning
      return {
        top: `${position.y}%`,
        transform: side === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)'
      };
    }
  };

  return (
    <div
      className={`fixed ${getPositionClasses()} z-30 transition-all duration-200`}
      style={getInlineStyles()}
    >
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        className={`
          text-white p-3 rounded-full shadow-lg transition-all duration-300 
          transform hover:scale-110 active:scale-95 relative
          ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}
          ${className}
        `}
        title={`${title} (Drag to move${allowHorizontal ? ' horizontally and vertically' : ' vertically'})`}
      >
        {children}
        
        {/* Drag indicator */}
        <div className={`
          absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white 
          transition-all duration-200
          ${isDragging ? 'bg-yellow-400 opacity-100' : 'bg-white/30 opacity-0 hover:opacity-100'}
        `}>
          <div className="w-full h-full rounded-full bg-white/50" />
        </div>
        
        {/* Movement guidelines */}
        {isDragging && (
          <>
            <div className="fixed left-0 right-0 h-0.5 bg-white/20 pointer-events-none" style={{ top: '10%' }} />
            <div className="fixed left-0 right-0 h-0.5 bg-white/20 pointer-events-none" style={{ top: '50%' }} />
            <div className="fixed left-0 right-0 h-0.5 bg-white/20 pointer-events-none" style={{ top: '90%' }} />
            {allowHorizontal && (
              <>
                <div className="fixed top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none" style={{ left: '10%' }} />
                <div className="fixed top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none" style={{ left: '50%' }} />
                <div className="fixed top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none" style={{ left: '90%' }} />
              </>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default DraggableButton;