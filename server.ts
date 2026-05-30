import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { INITIAL_WORDS, CATEGORIES } from "./src/data/dictionary";
import { generateFullProceduralDictionary } from "./src/data/procedural";
import { WordItem } from "./src/types";
import { dbManager } from "./serverDb";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client lazy-loaded or directly if key is available
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to use AI features.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// In-memory array of words loaded from db or generated on startup
let sessionWords: WordItem[] = dbManager.getPersistentWords();
if (!sessionWords || sessionWords.length === 0) {
  sessionWords = generateFullProceduralDictionary();
  dbManager.savePersistentWords(sessionWords);
}

// Keep track of total dynamic counter
app.get("/api/words", (req, res) => {
  res.json({
    categories: CATEGORIES,
    words: sessionWords
  });
});

// Endpoint to generate 15-20 more words dynamically using Gemini API
app.post("/api/gemini/generate-items", async (req, res) => {
  const { category, existingWords } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    const ai = getAiClient();
    const existingWordsList = Array.isArray(existingWords) ? existingWords.join(", ") : "";

    const userPrompt = `Generate 15 entirely unique, cool, and super useful English elements in the category: '${category}'.
Each item must make the user sound incredibly sophisticated, cool, and score a solid IELTS 8+ on their speaking/writing sections.
Ensure that NONE of these items overlap or repeat any of these existing words: [${existingWordsList}].
Keep the definition precise, create a vivid example, and make the Uzbek translation highly natural and conversational.
For the category 'instead_of', fill in the 'ratherThan' field (e.g. 'Very sad', 'To start').`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "You are an Elite British-American English Coach helping Uzbek students achieve IELTS 8+ band score. Return a valid JSON array matching the schema exactly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { 
                type: Type.STRING, 
                description: "The premium phrase, slang, filler, phrasal verb, texting acronym, or alternative" 
              },
              definition: { 
                type: Type.STRING, 
                description: "English dictionary-level definition, clear and precise" 
              },
              translation: { 
                type: Type.STRING, 
                description: "Natural, rich translation or explanation in Uzbek describing the real-life vibe" 
              },
              example: { 
                type: Type.STRING, 
                description: "A highly practical and natural IELTS-friendly example sentence" 
              },
              ieltsTip: { 
                type: Type.STRING, 
                description: "A practical band-8 coaching tip on how to deploy this phrase or sound cool" 
              },
              ratherThan: { 
                type: Type.STRING, 
                description: "Only populate if category is 'instead_of', indicating the normal/boring word replaced" 
              }
            },
            required: ["word", "definition", "translation", "example", "ieltsTip"]
          }
        }
      }
    });

    const generatedText = response.text;
    if (!generatedText) {
      throw new Error("Unable to generate text content from AI service.");
    }

    const items: any[] = JSON.parse(generatedText.trim());
    
    // Add IDs and categories, mark as generated
    const formattedItems: WordItem[] = items.map((item, index) => ({
      id: `generated-${category}-${Date.now()}-${index}`,
      word: item.word,
      category,
      definition: item.definition,
      translation: item.translation,
      example: item.example,
      ieltsTip: item.ieltsTip,
      ratherThan: item.ratherThan || undefined,
      isAiGenerated: true
    }));

    // Filter duplicates
    const uniqueItems = formattedItems.filter(
      (newWord) => !sessionWords.some((w) => w.word.toLowerCase() === newWord.word.toLowerCase())
    );

    // Append to memory
    sessionWords = [...sessionWords, ...uniqueItems];
    dbManager.savePersistentWords(sessionWords);

    res.json({
      success: true,
      newItems: uniqueItems,
      totalCountInCategory: sessionWords.filter(w => w.category === category).length
    });

  } catch (error: any) {
    console.error("AI Generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate dynamic phrases" });
  }
});

// Endpoint to reset session dictionary back to default
app.post("/api/words/reset", (req, res) => {
  sessionWords = [...INITIAL_WORDS];
  dbManager.savePersistentWords(sessionWords);
  res.json({ success: true, words: sessionWords });
});

// Authentication System: Login and registration
app.post("/api/auth/login-register", (req, res) => {
  const { username, password } = req.body;
  const result = dbManager.registerOrLogin(username, password);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// Score submit endpoint
app.post("/api/score/submit", (req, res) => {
  const { username, pointsEarned } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  const result = dbManager.submitScore(username, pointsEarned || 0);
  res.json(result);
});

// Leaderboard list endpoint
app.get("/api/leaderboard", (req, res) => {
  const { username } = req.query;
  const result = dbManager.getLeaderboard(username as string);
  res.json(result);
});

// Daily smart quiz words endpoint - 5 words updated daily randomly
app.get("/api/quiz/daily", (req, res) => {
  try {
    const dailyWords = dbManager.getDailyQuizQuestions(sessionWords);
    res.json({ success: true, questions: dailyWords });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to load daily questions" });
  }
});

// AI Practice Partner Chat Endpoint
app.post("/api/gemini/practice-chat", async (req, res) => {
  const { messages, categoryName, wordList } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const ai = getAiClient();
    const formattedHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Compile active coaching prompt
    const systemPrompt = `You are Idrokbek, a friendly, ultra-cool, and supportive English coaching partner.
The user is learning English vocabulary in the category: "${categoryName || 'General English'}".
The target words/phrases they are practicing are: ${Array.isArray(wordList) ? wordList.slice(0, 15).join(', ') : 'any modern idiom or phrasal verb'}.

Your task:
1. Hold a regular, fun conversation. Ask casual questions to keep them talking.
2. Teach, praise, or gently correct their use of English.
3. Every now and then, challenge them to use one of the words, or explain one.
4. Keep your replies concise (maximum 3-4 sentences), encouraging, and very natural.
5. You can occasionally speak 10-15% in simplified Uzbek if they ask or look confused, but keep 90% of the chat in English to boost their immersion.
6. Make them look cool! Raise their confidence toward IELTS 8+.`;

    // Extract the last message
    const lastMessage = formattedHistory[formattedHistory.length - 1];
    const historyWithoutLast = formattedHistory.slice(0, formattedHistory.length - 1);

    // Use chats API or simple generateContent with history
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...historyWithoutLast,
        { role: lastMessage.role, parts: lastMessage.parts }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8
      }
    });

    const replyText = response.text || "I'm having a small signal glitch. Could you say that again, mate?";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to generate chat reply" });
  }
});

// Vite server integration
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Helpful English Server] Web Application running on http://localhost:${PORT}`);
  });
};

startServer();
