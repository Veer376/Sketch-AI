import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

interface GeminiResponseCardProps {
  response: string;
  isVisible: boolean;
  onClose?: () => void;
}

export const GeminiResponseCard: React.FC<GeminiResponseCardProps> = ({
  response,
  isVisible,
  onClose
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const cardRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ x: number; y: number; isResizing: boolean }>({
    x: 0,
    y: 0,
    isResizing: false
  });

  // Start animation when component becomes visible
  useEffect(() => {
    if (isVisible) {
      // Reset animation state when becoming visible
      setAnimationComplete(false);
      
      // Complete animation after 2 seconds
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      resizeRef.current = {
        x: e.clientX,
        y: e.clientY,
        isResizing: true
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizeRef.current.isResizing && cardRef.current) {
      const deltaX = e.clientX - resizeRef.current.x;
      const deltaY = e.clientY - resizeRef.current.y;
      
      setDimensions(prev => ({
        width: Math.max(200, prev.width + deltaX),
        height: Math.max(150, prev.height + deltaY)
      }));
      
      resizeRef.current.x = e.clientX;
      resizeRef.current.y = e.clientY;
    }
  };

  const handleMouseUp = () => {
    resizeRef.current.isResizing = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute left-1/4 top-1/4 z-50"
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
      }}
      ref={cardRef}
    >
      <div className="relative w-full h-full">
        {/* Animated border container */}
        <div 
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{ 
            background: animationComplete 
              ? 'linear-gradient(45deg, #8e2de2, #4a00e0, #8e2de2)' 
              : 'transparent',
          }}
        >
          {/* Animated gradient that moves around perimeter */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-purple-600",
              animationComplete ? "opacity-100" : "animate-border-flow"
            )}
          />
        </div>
        
        {/* Inner content container */}
        <div 
          className="absolute inset-[2px] rounded-[calc(1.5rem-2px)] bg-white dark:bg-slate-900 flex flex-col p-4 overflow-hidden"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-sm">×</span>
          </button>
          
          {/* Title */}
          <div className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Gemini Response</div>
          
          {/* Response content */}
          <div className="flex-1 overflow-y-auto text-gray-700 dark:text-gray-200">
            {response}
          </div>
          
          {/* Resize handle */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleMouseDown}
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12"
              className="absolute bottom-1 right-1 fill-current text-gray-400"
            >
              <path d="M10.5 1.5L1.5 10.5M7.5 10.5L10.5 10.5L10.5 7.5" stroke="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};