export interface WordItem {
  id: string;
  word: string;
  category: string;
  definition: string;
  translation: string;
  example: string;
  ieltsTip: string;
  ratherThan?: string; // Specifically for the 'instead_of' category
  isAiGenerated?: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  emoji: string;
  descriptionUz: string;
  descriptionEng: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  word: string;
  hint: string;
  options: string[];
  correctAnswer: string;
  category: string;
  explanation: string;
}
