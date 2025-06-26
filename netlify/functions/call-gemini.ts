
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// Define the structure of the payload expected from the client
interface ClientPayload {
  prompt: string;
  productImageData?: string;
  productMimeType?: string;
  avatarImageData?: string;
  avatarMimeType?: string;
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    };
  }

  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("CRITICAL: API_KEY environment variable is not set in Netlify Function.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key is not configured on the server." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  let clientPayload: ClientPayload;
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Request body is missing." }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    clientPayload = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing request body:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // Validate required clientPayload fields
  if (!clientPayload.prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'prompt' in request body." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const parts: Part[] = [];

  // Add image parts if they exist
  // It's good practice to provide context for each image if sending multiple.
  if (clientPayload.productImageData && clientPayload.productMimeType) {
    parts.push({ text: "Image 1 (Product Image):" }); 
    parts.push({
      inlineData: {
        data: clientPayload.productImageData,
        mimeType: clientPayload.productMimeType,
      },
    });
  }

  if (clientPayload.avatarImageData && clientPayload.avatarMimeType) {
    parts.push({ text: "Image 2 (Character Avatar Image):" }); 
    parts.push({
      inlineData: {
        data: clientPayload.avatarImageData,
        mimeType: clientPayload.avatarMimeType,
      },
    });
  }
  
  // Add the main text prompt
  parts.push({ text: clientPayload.prompt });

  try {
    const model = 'gemini-2.5-flash-preview-04-17'; // Correct model
    const genAIResponse: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts }], // Ensure 'parts' is correctly structured for 'contents'
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = genAIResponse.text.trim();
    // Standard fence removal for JSON responses from Gemini
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    // Validate if jsonStr is actually JSON before sending
    // This is a good practice to ensure the client receives what it expects.
    try {
        JSON.parse(jsonStr); // Test parsing
    } catch (e) {
        console.error("Gemini API returned non-JSON text after attempting to extract:", jsonStr);
        // It's important to decide how to handle cases where the model doesn't return valid JSON
        // despite being asked to. Returning an error helps in debugging.
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Gemini API response was not valid JSON as expected.", 
                details: `Raw model output: ${genAIResponse.text}` // Provide raw output for debugging
            }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: jsonStr }), // Send back the extracted JSON string
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error("Error calling Gemini API from Netlify Function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the Gemini API.";
    // Consider logging more details of the error if possible, e.g., error.stack
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Gemini API Error: ${errorMessage}` }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
