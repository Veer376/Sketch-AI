import React, { useState } from "react";
import { SketchIcon } from "./ui/sketch-icon";
import { User } from "firebase/auth";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user?: User | null;
  onSignIn?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, user, onSignIn }) => {
  console.log('Sidebar rendering, isOpen:', isOpen);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sample history items - replace with actual data from your state management
  const historyItems = [
    { id: 1, title: "UI Design Sketch", date: "Apr 17, 2025" },
    { id: 2, title: "User Flow Diagram", date: "Apr 15, 2025" },
    { id: 3, title: "Project Mindmap", date: "Apr 12, 2025" },
    { id: 4, title: "Meeting Notes", date: "Apr 10, 2025" },
  ];

  const links = [
    {
      label: "History",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3" />
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      ),
      hasDropdown: true,
      onClick: () => setIsHistoryOpen(!isHistoryOpen),
      isOpen: isHistoryOpen
    },
    {
      label: "Settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1-2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

  // Function to handle user click
  const handleUserClick = () => {
    if (onSignIn) {
      onSignIn();
    }
  };

  // Get user initials or default to 'G' for guest
  const getUserInitials = () => {
    if (user && user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`;
      }
      return names[0][0];
    }
    return 'G';
  };

  // Get user display info
  const getUserInfo = () => {
    if (user) {
      return {
        name: user.displayName || 'Signed In User',
        status: user.email || 'Authenticated'
      };
    }
    return {
      name: 'Guest User',
      status: 'No account'
    };
  };

  const userInfo = getUserInfo();

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
          <div key={idx} className="flex flex-col">
            <button
              onClick={link.onClick}
              className={`flex items-center ${
                isOpen ? 'justify-start px-4' : 'justify-center'
              } py-3 rounded-md hover:bg-gray-100 transition-all`}
            >
              <div className="flex-shrink-0 text-gray-700">
                {link.icon}
              </div>
              {isOpen && (
                <div className="ml-3 flex justify-between items-center w-full">
                  <span className="text-sm font-medium text-gray-900">
                    {link.label}
                  </span>
                  {link.hasDropdown && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform ${link.isOpen ? 'rotate-180' : ''}`} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </div>
              )}
            </button>
            
            {/* Dropdown for History */}
            {link.label === "History" && link.isOpen && isOpen && (
              <div className="ml-8 mt-1 mb-2 bg-gray-50 rounded-md overflow-hidden">
                {historyItems.map(item => (
                  <button 
                    key={item.id}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex justify-between items-center border-l-2 border-transparent hover:border-purple-500"
                    onClick={() => console.log(`Opening note: ${item.title}`)}
                  >
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10H16M8 14H16M8 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium text-gray-800">{item.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button 
          className={`flex items-center ${
            isOpen ? 'justify-start' : 'justify-center'
          } py-2 w-full hover:bg-gray-100 rounded-md transition-all`}
          onClick={handleUserClick}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
            {getUserInitials()}
          </div>
          {isOpen && (
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
              <p className="text-xs text-gray-500">{userInfo.status}</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;