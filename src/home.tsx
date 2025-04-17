// filepath: c:\Users\aryav\projects\canvas\src\home.tsx
import React, { useState, useRef } from 'react';
import Canvas from './components/canvas/canvas';
import Sidebar from './components/sidebar';
import { Gemini } from './components/shared/Gemini';
import './App.css';
import {CanvasRef} from './components/canvas/canvas';
// import { GeminiResponseCard } from './components/shared/GeminiResponseCard';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm0XnoJtnXg-zmU5_K0nOe91gwN9UTGjA",
  authDomain: "sketch-ai-24179.firebaseapp.com",
  projectId: "sketch-ai-24179",
  storageBucket: "sketch-ai-24179.firebasestorage.app",
  messagingSenderId: "655089242692",
  appId: "1:655089242692:web:37ab19af9a88788d412211",
  measurementId: "G-BBXWNTXZMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasRef = useRef<CanvasRef>(null);
  const [user, setUser] = useState<User | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      // Get the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      console.log("Google Auth Token:", token);
    } catch (error) {
      console.error("Error during sign in:", error);
    }
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
      
      {/* Gemini*/}
      <Gemini canvasRef={canvasRef} />
      
      {/* Sidebar overlays on top of canvas */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        user={user}
        onSignIn={handleGoogleSignIn}
      />
    </div>
  );
};

export default Home;