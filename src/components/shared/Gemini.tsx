import React, { useState } from "react";
import { Button } from "../ui/moving-border";
import { CanvasRef } from "../canvas/canvas";
import { processGeminiRequest } from "../../services/api"; // Adjust the import path as necessary
import { GeminiResponseCard } from "./GeminiResponseCard";

interface GeminiButtonProps {
  canvasRef?: React.RefObject<CanvasRef | null>;
}

export function Gemini({canvasRef}: GeminiButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleClick = async () => {
    // If no canvas reference is provided, we can't process anything
    console.log('CanvasRef:', canvasRef);
    if (!canvasRef?.current) {
      console.error('Cannot process canvas: No canvas reference provided');
      return;
    }

    try {
      setIsProcessing(true);
      // Process the canvas with Gemini
      const prompt = "Analyze this image and identify any text, diagrams, or drawings. If there are questions written on the canvas, please answer them.";
      const imageBase64 = canvasRef.current.captureImage(); // Capture the image from the canvas
      if (!imageBase64) {
        throw new Error("Failed to capture canvas image");
      }
      
      const result = await processGeminiRequest(prompt, imageBase64);
      
      // Handle the response
      if (result && result.response) {
        setResponse(result.response);
        setShowResponse(true);
      } else {
        setResponse("Sorry, I couldn't analyze the image properly. Please try again.");
        setShowResponse(true);
      }
    } catch (error) {
      console.error('Error processing canvas with Gemini:', error);
      setResponse("An error occurred while processing your request. Please try again.");
      setShowResponse(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseResponse = () => {
    setShowResponse(false);
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <Button
          borderRadius="1.75rem"
          className={`bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 ${isProcessing ? 'opacity-75 cursor-wait' : ''}`}
          onClick={handleClick}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Ask Gemini'}
        </Button>
      </div>
      
      {/* Render the GeminiResponseCard with the gemini response */}
      {response && (
        <GeminiResponseCard
          response={response}
          isVisible={showResponse}
          onClose={handleCloseResponse}
        />
      )}
    </>
  );
}