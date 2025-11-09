import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { GripHorizontal, Minimize2, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export default function DraggableCard({
  children,
  className,
  initialPosition = { x: 8, y: 24 },
  initialSize = { width: 320, height: 'auto' },
  minSize = { width: 250, height: 200 },
  maxSize = { width: 600, height: 800 },
}: {
  children: React.ReactNode;
  className?: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number | 'auto' };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}) {
  const [pos, setPos] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    origWidth: number;
    origHeight: number;
  } | null>(null);
  const animationRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start drag when clicking the drag handle area
    const target = e.target as HTMLElement;
    if (!target.closest('.drag-handle')) {
      return;
    }

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    // Use RAF for smooth 60fps updates
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      if (!dragRef.current) return;
      const d = dragRef.current;
      const nx = d.origX + (e.clientX - d.startX);
      const ny = d.origY + (e.clientY - d.startY);
      
      // Add boundary constraints (optional - keeps card on screen)
      const maxX = window.innerWidth - 300;
      const maxY = window.innerHeight - 200;
      const constrainedX = Math.max(0, Math.min(nx, maxX));
      const constrainedY = Math.max(0, Math.min(ny, maxY));
      
      setPos({ x: constrainedX, y: constrainedY });
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    dragRef.current = null;
    resizeRef.current = null;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    const currentHeight = typeof size.height === 'number' ? size.height : cardRef.current?.offsetHeight || 400;
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origWidth: size.width,
      origHeight: currentHeight,
    };
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeRef.current) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      if (!resizeRef.current) return;
      const r = resizeRef.current;
      
      let newWidth = r.origWidth + (e.clientX - r.startX);
      let newHeight = r.origHeight + (e.clientY - r.startY);
      
      // Apply constraints
      newWidth = Math.max(minSize.width, Math.min(newWidth, maxSize.width));
      newHeight = Math.max(minSize.height, Math.min(newHeight, maxSize.height));
      
      setSize({ width: newWidth, height: newHeight });
    });
  }, [isResizing, minSize, maxSize]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';
      
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isResizing, handleResizeMove, handleMouseUp]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Delay blur to check if focus moved to a child
    setTimeout(() => {
      if (cardRef.current && !cardRef.current.contains(document.activeElement)) {
        setIsFocused(false);
      } else if (cardRef.current && cardRef.current.contains(document.activeElement)) {
        setIsFocused(true);
      }
      else{
        setIsFocused(false);
      }
    }, 100);
  }, []);

  const toggleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(prev => !prev);
  }, []);

  return (
    <div
      ref={cardRef}
      style={{ 
        position: 'absolute', 
        left: pos.x, 
        top: pos.y,
        width: size.width,
        height: isMinimized ? 'auto' : size.height,
        touchAction: 'none', 
        zIndex: isFocused ? 100 : (isDragging ? 100 : 60),
        userSelect: 'none',
        willChange: isDragging || isResizing ? 'transform' : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleFocus}
      tabIndex={0}
      className={cn(
        "rounded-lg outline-none transition-opacity duration-200",
        (isFocused || isHovering) ? "opacity-100" : "opacity-60"
      )}
    >
      <Card className={cn(
        "overflow-hidden backdrop-blur-md transition-all duration-150 h-full flex flex-col",
        "bg-zinc-950 shadow-2xl border-none",
        className
      )}>
        {/* Draggable handle area inside card */}
        <div 
          className={cn(
            "drag-handle px-3 py-2 flex items-center justify-between transition-all duration-150 relative shrink-0",
            isDragging 
              ? "cursor-grabbing" 
              : "cursor-grab"
          )}
        >
          <GripHorizontal 
            className={cn(
              "transition-all duration-150",
              isDragging ? "text-gray-200" : "hover:text-gray-200 text-gray-300"
            )} 
            size={16}
            strokeWidth={2}
          />

          {/* Control buttons */}
          <Button
            onClick={toggleMinimize}
            size={"icon"}
            variant={"ghost"}
            className="bg-zinc-950 hover:bg-zinc-800 text-gray-100 hover:text-gray-100"
            title={isMinimized ? "Expand" : "Collapse"}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </Button>
        </div>
        
        {/* Content area */}
        {!isMinimized && (
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        )}

        {/* Resize handle */}
        {!isMinimized && (
          <div
            onMouseDown={handleResizeStart}
            className={cn(
              "absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group shrink-0",
              "hover:bg-muted/30 rounded-tl transition-colors"
            )}
            title="Resize"
          >
          </div>
        )}
      </Card>
    </div>
  );
}
