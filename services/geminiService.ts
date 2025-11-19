
import { GoogleGenAI, Chat } from "@google/genai";

// Initialize lazily to prevent app crash if key is missing during initial load
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Google GenAI client:", error);
  }
}

let chat: Chat | null = null;

export const startChatSession = () => {
  if (!ai) return;

  try {
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are 'Study Buddy', a friendly and encouraging AI tutor for 'Lyceum Academy'. Your goal is to help students understand their course material. Explain concepts clearly, provide examples, and answer questions related to their studies. Keep your responses concise and helpful. Never go off-topic from educational content.",
      },
    });
  } catch (error) {
    console.error("Failed to create chat session:", error);
  }
};

export const sendMessageToAI = async (message: string) => {
  if (!ai) {
    throw new Error("API Key is missing. Please configure the API_KEY environment variable to use Study Buddy.");
  }
  if (!chat) {
    startChatSession();
  }
  if (chat) {
    return chat.sendMessageStream({ message });
  }
  throw new Error("Chat session could not be initialized.");
};
