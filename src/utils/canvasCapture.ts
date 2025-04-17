// /**
//  * Canvas capture utility for Gemini AI processing
//  * Handles capturing the canvas state and sending it to the Gemini API
//  */

// import { CanvasRef } from '../components/canvas/canvas';
// import { processGeminiRequest } from '../services/api';

// /**
//  * Captures the current canvas as a base64 image
//  * @param canvasRef Reference to the Canvas component
//  * @returns Promise that resolves with the base64 encoded image string
//  */
// export const captureCanvas = async (canvasRef: React.RefObject<CanvasRef>): Promise<string> => {
//   if (!canvasRef.current) {
//     throw new Error('Canvas reference is not available');
//   }
  
//   try {
//     // Use the captureImage method from the Canvas component
//     const dataUrl = canvasRef.current.captureImage();
    
//     if (!dataUrl) {
//       throw new Error('Failed to capture canvas image');
//     }
    
//     // Return just the base64 data (remove the "data:image/png;base64," prefix)
//     return dataUrl.split(',')[1];
//   } catch (error) {
//     console.error('Error capturing canvas:', error);
//     throw new Error('Failed to capture canvas content');
//   }
// };

// /**
//  * Process canvas content with Gemini AI
//  * @param canvasRef Reference to the Canvas component
//  * @param prompt Optional text prompt to provide context to Gemini
//  * @returns Promise with the processing result
//  */
// export const processCanvasWithGemini = async (
//   canvasRef: React.RefObject<CanvasRef>,
//   prompt: string = 'Analyze this image and answer any questions written on it'
// ): Promise<any> => {
//   try {
//     // Capture canvas as base64 image
//     const imageBase64 = await captureCanvas(canvasRef);
    
//     // Log for debugging (remove in production)
//     console.log('Canvas captured successfully, image size:', 
//       Math.round(imageBase64.length * 0.75 / 1000), 'KB');
    
//     // Send to Gemini API
//     const response = await processGeminiRequest(prompt, imageBase64);
    
//     console.log('Gemini API response:', response);
    
//     return response;
//   } catch (error) {
//     console.error('Error processing canvas with Gemini:', error);
//     throw error;
//   }
// };