/**
 * API service for Gemini model interactions
 */

// Correctly access Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface GeminiRequestPayload {
  prompt?: string;
  image?: string; // Base64 encoded image
}

interface GeminiResponse {
  response: string;
  error?: string;
  status: 'success' | 'error';
}

/**
 * Send canvas image to Gemini API for processing
 * @param prompt The text prompt for Gemini
 * @param imageBase64 Base64 encoded image data (optional)
 * @returns Promise resolving to the Gemini response
 */
export const processGeminiRequest = async (
  prompt?: string,
  imageBase64?: string
): Promise<GeminiResponse> => {
  
  const url = `${API_BASE_URL}/gemini/generate`;
  
  try {
    const payload: GeminiRequestPayload = {
      prompt: prompt || "Analyze this image and identify any text, diagrams, or drawings." 
    };
    
    // Add image to payload if provided
    if (imageBase64) {

      //The format of the imageBase64 is data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
      const base64Data = imageBase64.includes('base64,') 
        ? imageBase64.split('base64,')[1] 
        : imageBase64;
        
      payload.image = base64Data;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return {
      response: data.response || 'No response from Gemini API',
      status: 'success'
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      response: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'error'
    };
  }
};

/**
 * Helper function to check if the API server is available
 * @returns Promise resolving to true if server is available, false otherwise
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('API server not available:', error);
    return false;
  }
};