import fs from "fs";
import path from "path";
import crypto from "crypto";
import { WordItem } from "./src/types";

const DB_FILE = path.join(process.cwd(), "database.json");

interface UserRecord {
  username: string;
  passwordHash: string;
  score: number;
  solvedQuizzesCount: number;
  createdAt: string;
}

interface DatabaseSchema {
  users: { [username: string]: UserRecord };
  words: WordItem[];
  dailySeedDate: string;
  dailyQuestions: string[]; // Store ids of words chosen for today's quiz
}

// Simple internal helper to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

class ServerDbManager {
  private data: DatabaseSchema = {
    users: {},
    words: [],
    dailySeedDate: "",
    dailyQuestions: [],
  };

  constructor() {
    this.load();
  }

  // Load database from file
  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        console.log(`[Database] Loaded successfully. ${Object.keys(this.data.users).length} users, ${this.data.words.length} persistent words.`);
      } else {
        console.log("[Database] File not found, initializing empty database.");
        this.save();
      }
    } catch (error) {
      console.error("[Database] Load error, using default empty structure:", error);
    }
  }

  // Save database to file
  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("[Database] Save error:", error);
    }
  }

  // Register a new user or authenticate existing one
  public registerOrLogin(username: string, passwordPlain: string): { success: boolean; message: string; user?: { username: string; score: number; solvedQuizzesCount: number } } {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak!" };
    }
    if (!passwordPlain || passwordPlain.length < 4) {
      return { success: false, message: "Parol kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }

    const hash = hashPassword(passwordPlain);

    if (this.data.users[cleanUsername]) {
      // Login attempt
      const user = this.data.users[cleanUsername];
      if (user.passwordHash === hash) {
        return {
          success: true,
          message: "Tizimga muvaffaqiyatli kirildi!",
          user: {
            username: user.username, // keep original casing
            score: user.score,
            solvedQuizzesCount: user.solvedQuizzesCount,
          }
        };
      } else {
        return { success: false, message: "Noto'g'ri parol! Iltimos qaytadan urinib ko'ring." };
      }
    } else {
      // Automatic silent registration
      const originalCasing = username.trim();
      const newUser: UserRecord = {
        username: originalCasing,
        passwordHash: hash,
        score: 0,
        solvedQuizzesCount: 0,
        createdAt: new Date().toISOString(),
      };
      this.data.users[cleanUsername] = newUser;
      this.save();
      return {
        success: true,
        message: "Yangi akkount muvaffaqiyatli yaratildi!",
        user: {
          username: newUser.username,
          score: newUser.score,
          solvedQuizzesCount: newUser.solvedQuizzesCount,
        }
      };
    }
  }

  // Submit/increment quiz score
  public submitScore(username: string, pointsEarned: number): { success: boolean; score: number } {
    const cleanUsername = username.trim().toLowerCase();
    if (this.data.users[cleanUsername]) {
      this.data.users[cleanUsername].score += pointsEarned;
      this.data.users[cleanUsername].solvedQuizzesCount += 1;
      this.save();
      return { success: true, score: this.data.users[cleanUsername].score };
    }
    return { success: false, score: 0 };
  }

  // Fetch leaderboard ranking and statistics
  public getLeaderboard(username?: string): { topUsers: any[]; userRank: number; userScore: number; totalUsers: number } {
    // Sort users descending by high score
    const allUsers = Object.values(this.data.users)
      .map(u => ({ username: u.username, score: u.score, solvedQuizzesCount: u.solvedQuizzesCount }))
      .sort((a, b) => b.score - a.score);

    const topUsers = allUsers.slice(0, 5); // Return top 5, UI will gorgeous render top 3 and others

    let userRank = -1;
    let userScore = 0;
    const cleanUsername = username?.trim().toLowerCase();

    if (cleanUsername) {
      userRank = allUsers.findIndex(u => u.username.toLowerCase() === cleanUsername) + 1;
      if (userRank > 0) {
        userScore = this.data.users[cleanUsername].score;
      }
    }

    return {
      topUsers,
      userRank: userRank > 0 ? userRank : allUsers.length + 1,
      userScore,
      totalUsers: allUsers.length
    };
  }

  // Word Persistence Manager
  public getPersistentWords(): WordItem[] {
    return this.data.words;
  }

  public savePersistentWords(words: WordItem[]) {
    this.data.words = words;
    this.save();
  }

  // Retrieve stable daily questions using seeded randomization
  public getDailyQuizQuestions(allWords: WordItem[]): WordItem[] {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Check if we need to rotate/calculate today's questions
    if (this.data.dailySeedDate !== todayStr || this.data.dailyQuestions.length === 0) {
      if (allWords.length >= 5) {
        // Simple seeded generator
        const selected: string[] = [];
        const pool = [...allWords];
        
        // Custom simple hash-based pseudo random from date string seed
        let seed = 0;
        for (let i = 0; i < todayStr.length; i++) {
          seed += todayStr.charCodeAt(i);
        }

        for (let q = 0; q < 5; q++) {
          const rand = (seed * (q + 1) * 31) % pool.length;
          const chosen = pool.splice(rand, 1)[0];
          selected.push(chosen.id);
        }

        this.data.dailySeedDate = todayStr;
        this.data.dailyQuestions = selected;
        this.save();
      }
    }

    // Resolve ids to original words, fall back if any is missing
    const todayQuestions = this.data.dailyQuestions
      .map(id => allWords.find(w => w.id === id))
      .filter((w): w is WordItem => !!w);

    if (todayQuestions.length < 5) {
      // Fallback: pick any random 5
      return allWords.slice(0, 5);
    }

    return todayQuestions;
  }
}

export const dbManager = new ServerDbManager();
