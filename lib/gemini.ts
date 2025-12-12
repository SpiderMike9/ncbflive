import { GoogleGenerativeAI } from "@google/generative-ai";

// In a real Next.js app, access environment variables properly
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '') || 'mock-key';

let genAI: GoogleGenerativeAI | null = null;

try {
    if (API_KEY && API_KEY !== 'mock-key') {
        genAI = new GoogleGenerativeAI(API_KEY);
    }
} catch (e) {
    console.warn("Gemini Client Init Failed", e);
}

export const generateMarketingContent = async (task: string, context: string): Promise<string> => {
  if (!genAI) return "AI Service Unavailable (Check API Key)";
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Task: ${task}\nContext: ${context}` }] }],
      generationConfig: { temperature: 0.8 }
    });
    const response = await result.response;
    return response.text() || "No content generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content.";
  }
};