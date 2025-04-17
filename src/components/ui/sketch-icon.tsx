interface SketchIconProps {
    size?: number;         // Overall icon size
    strokeWidth?: number;  // Stroke thickness
    className?: string;    // Additional classes
  }
  
export const SketchIcon: React.FC<SketchIconProps> = ({ 
    size = 32, 
    strokeWidth = 8,  // Increased from 6 to 8 for better visibility
    className = "" 
  }) => {
    // Calculate proportional highlight stroke width
    const highlightStrokeWidth = Math.max(strokeWidth / 1.5, 2);
    
    return (
      <div 
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Main sketch stroke container */}
        <div className="relative w-full h-2/3">
          {/* Base sketch stroke with gradient thickness */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M5,35 Q25,10 50,25 T95,20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-gray-800"
                strokeDasharray="0 0"
              >
                {/* Animation for drawing effect */}
                <animate 
                  attributeName="stroke-dasharray" 
                  from="0 150" 
                  to="150 0" 
                  dur="0.5s" 
                  begin="0s"
                  fill="freeze"
                />
              </path>
            </svg>
          </div>
          
          {/* Highlight stroke for dimension */}
          <div className="absolute top-0 left-0 w-full h-full -translate-y-px -translate-x-px opacity-40">
            <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M5,35 Q25,10 50,25 T95,20" 
                fill="none" 
                stroke="white" 
                strokeWidth={highlightStrokeWidth}
                strokeLinecap="round"
                strokeDasharray="0 0"
              >
                {/* Animation for drawing effect */}
                <animate 
                  attributeName="stroke-dasharray" 
                  from="0 150" 
                  to="150 0" 
                  dur="1.7s" 
                  begin="0s"
                  fill="freeze"
                />
              </path>
            </svg>
          </div>
        </div>
  
        {/* Small decorative stroke for a pencil/brush feel */}
        <div className="absolute bottom-2 right-1" style={{ width: `${size/4}px`, height: `${size/8}px` }}>
          <svg viewBox="0 0 20 10" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M2,8 Q5,2 18,4" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={highlightStrokeWidth}
              strokeLinecap="round"
              className="text-gray-600"
            />
          </svg>
        </div>
      </div>
    );
  };