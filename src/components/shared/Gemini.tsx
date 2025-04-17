import React, { useState } from "react";
import { Button } from "../ui/moving-border";
import { CanvasRef } from "../canvas/canvas";
import { processGeminiRequest } from "../../services/api";

interface GeminiButtonProps {
  canvasRef?: React.RefObject<CanvasRef | null>;
}

export function Gemini({canvasRef}: GeminiButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    // If no canvas reference is provided, we can't process anything
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
      
      // Handle the response by adding it to the canvas
      if (result && result.response) {
        // Calculate a good position for the card (center of visible canvas)
        const stage = canvasRef.current.getStage();
        const scale = stage.scaleX();
        const stagePos = stage.position();
        const stageSize = {
          width: stage.width(),
          height: stage.height()
        };
        
        // Position in the center of the current view
        const position = {
          x: (-stagePos.x / scale) + (stageSize.width / scale / 2) - 150, // Center minus half card width
          y: (-stagePos.y / scale) + (stageSize.height / scale / 2) - 75  // Center minus half card height
        };
        
        // Add the response card to the canvas
        const cardId = canvasRef.current.addGeminiResponseCard(result.response, position);
      } else {
        console.error("No response from Gemini API");
      }
    } catch (error) {
      console.error('Error processing canvas with Gemini:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute top-4 right-20 z-50">
      <Button
        borderRadius="1.75rem"
        className={`bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 ${isProcessing ? 'cursor-wait' : ''}`}
        onClick={handleClick}
        disabled={isProcessing}
        animate={isProcessing} // Only animate when processing
        duration={1500} // Faster animation during processing
      >
        {isProcessing ? 'Processing...' : 'Ask Gemini'}
      </Button>
    </div>
  );
}