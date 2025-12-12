
import { GoogleGenAI } from "@google/generative-ai"

// In a real Next.js app, access environment variables properly
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'mock-key';

let aiClient: GoogleGenAI | null = null;

try {
    if (API_KEY && API_KEY !== 'mock-key') {
        aiClient = new GoogleGenAI({ apiKey: API_KEY });
    }
} catch (e) {
    console.warn("Gemini Client Init Failed", e);
}

export const generateMarketingContent = async (task: string, context: string): Promise<string> => {
  if (!aiClient) return "AI Service Unavailable (Check API Key)";
  try {
    const model = 'gemini-2.5-flash';
    const response = await aiClient.models.generateContent({
      model: model,
      contents: `Task: ${task}\nContext: ${context}`,
      config: { temperature: 0.8 }
    });
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content.";
  }
};
