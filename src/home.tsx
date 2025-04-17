// filepath: c:\Users\aryav\projects\canvas\src\home.tsx
import React, { useState, useRef } from 'react';
import Canvas from './components/canvas/canvas';
import Sidebar from './components/sidebar';
import { Gemini } from './components/shared/Gemini';
import './App.css';
import {CanvasRef} from './components/canvas/canvas';
import { GeminiResponseCard } from './components/shared/GeminiResponseCard';

const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasRef = useRef<CanvasRef>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <div className="home-container" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      padding: 0,
      margin: 0
    }}>
      {/* Canvas covers the entire viewport */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}>
        <Canvas ref={canvasRef} />
      </div>
      
      {/* Gemini button at the top right */}
      <Gemini
        canvasRef={canvasRef} 
      />
      
      {/* Sidebar overlays on top of canvas */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
};

export default Home;