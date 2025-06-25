
import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";

export interface GeminiPayload {
  prompt: string;
  productImageData?: string | null;
  productMimeType?: string | null;
  avatarImageData?: string | null;
  avatarMimeType?: string | null;
}

// Initialize the GoogleGenAI client with the API key
// process.env.API_KEY must be available in the execution environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-2.5-flash-preview-04-17'; // Recommended model

export const callGeminiAPI = async (payload: GeminiPayload): Promise<string> => {
  const { prompt, productImageData, productMimeType, avatarImageData, avatarMimeType } = payload;

  const parts: Part[] = [];

  // Always add the text prompt as the first part.
  parts.push({ text: prompt });

  // Add product image if available
  // This will be "Image 1" as referenced in prompts if avatar is also present
  if (productImageData && productMimeType) {
    parts.push({
      inlineData: {
        mimeType: productMimeType,
        data: productImageData,
      },
    });
  }

  // Add avatar image if available
  // This will be "Image 2" as referenced in prompts
  if (avatarImageData && avatarMimeType) {
    parts.push({
      inlineData: {
        mimeType: avatarMimeType,
        data: avatarImageData,
      },
    });
  }
  
  const contents: Content[] = [{ role: "user", parts }];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      // The prompts in App.tsx explicitly ask for JSON output.
      config: {
        responseMimeType: "application/json",
      }
    });
    
    // According to guidelines, response.text provides the string output.
    const responseText = response.text;
    if (responseText === undefined || responseText === null) {
        console.warn("Gemini API returned an empty or undefined text response. Checking candidates...");
        // Fallback for safety, though response.text should be the primary source.
        const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return candidateText;
        }
        throw new Error("Gemini API returned no text content in response or candidates.");
    }
    return responseText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // More specific error handling could be added here based on Gemini API error types if needed
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
