
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SketchIconProps {
  size?: number;         // Overall icon size
  strokeWidth?: number;  // Stroke thickness
  className?: string;    // Additional classes
}

const SketchIcon: React.FC<SketchIconProps> = ({ 
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


const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  console.log('Sidebar rendering, isOpen:', isOpen);

  const links = [
    {
      label: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
      ),
      onClick: () => console.log("Dashboard clicked")
    },
    {
      label: "Tools",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      onClick: () => console.log("Tools clicked")
    },
    {
      label: "Settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      onClick: () => console.log("Settings clicked")
    },
    {
      label: "Help",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      onClick: () => console.log("Help clicked")
    },
  ];

  return (
    <div 
      className={`absolute top-0 left-0 h-full z-10 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-16'
      } bg-white shadow-lg overflow-hidden`}
    >
      {/* Header with logo */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {isOpen && (
            <>
                {/* <div className="h-5 w-4 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-blue-600 flex-shrink-0" /> */}
                <SketchIcon size={50} strokeWidth={10}/>
                <span className="font-medium text-black transition-opacity duration-200">
                    Sketch-AI
                </span>
            </>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Navigation Links */}
      <div className="mt-8 flex flex-col gap-2 px-2">
        {links.map((link, idx) => (
          <button
            key={idx}
            onClick={link.onClick}
            className={`flex items-center ${
              isOpen ? 'justify-start px-4' : 'justify-center'
            } py-3 rounded-md hover:bg-gray-100 transition-all`}
          >
            <div className="flex-shrink-0 text-gray-700">
              {link.icon}
            </div>
            {isOpen && (
              <span className="ml-3 text-sm font-medium text-gray-900">
                {link.label}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button 
          className={`flex items-center ${
            isOpen ? 'justify-start' : 'justify-center'
          } py-2 w-full`}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
            G
          </div>
          {isOpen && (
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">Guest User</p>
              <p className="text-xs text-gray-500">No account</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;