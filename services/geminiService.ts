import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task, UserProfile, ScheduleItem, TaskCategory } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";
const imageModelName = "gemini-2.5-flash-image";

const scheduleSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timeSlot: { type: Type.STRING, description: "Start and end time, e.g., '09:00 - 10:00'" },
      taskId: { type: Type.STRING, description: "The ID of the task assigned to this slot, or 'break' if it is a break." },
      title: { type: Type.STRING, description: "Title of the activity" },
      category: { type: Type.STRING, description: "Category of the task" },
      description: { type: Type.STRING, description: "Short strategic advice or reason for placement." },
      isBreak: { type: Type.BOOLEAN, description: "True if this is a recovery period." }
    },
    required: ["timeSlot", "title", "category", "description", "isBreak"]
  }
};

const subTaskSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Actionable sub-task title" },
      durationMinutes: { type: Type.NUMBER, description: "Estimated duration in minutes" },
      category: { type: Type.STRING, description: "Category of the task" },
      priority: { type: Type.STRING, description: "Priority level (High, Medium, Low)" },
      energyRequired: { type: Type.STRING, description: "Energy level (High, Medium, Low)" }
    },
    required: ["title", "durationMinutes", "category", "priority", "energyRequired"]
  }
};

const yapSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A short, gen-z slang summary of the text" },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Actionable task title" },
          priority: { type: Type.STRING, description: "High/Medium/Low" }
        }
      }
    }
  }
};

export const generateSmartSchedule = async (
  tasks: Task[], 
  profile: UserProfile, 
  context: string = "Standard productivity flow"
): Promise<ScheduleItem[]> => {
  
  if (tasks.length === 0) return [];

  const prompt = `
    You are LOCK IN, an advanced AI productivity scheduler with a Gen Z personality.
    
    User Profile:
    - Wake up: ${profile.wakeUpTime}
    - Sleep: ${profile.sleepTime}
    - Peak Productivity: ${profile.productiveHours}

    USER STRATEGY / CONTEXT: "${context}"
    
    INSTRUCTIONS FOR AI:
    1. Adjust the pacing based on the USER STRATEGY.
       - If "Deep Work", "Grind", or "Focus": Create longer blocks, fewer breaks.
       - If "Chill", "Light", or "Recovery": Add more frequent "Touch Grass" breaks.
       - If unspecified, balance normally.
    
    Tasks to schedule:
    ${JSON.stringify(tasks)}

    Goal: Create an optimized daily timeline.
    Rules:
    1. Respect the user's wake and sleep times.
    2. Place High priority/High energy tasks during peak productivity hours (The "Locked In" hours).
    3. Insert short breaks (5-15 mins) between deep work sessions. Call them "Touch Grass" or "Vibe Check".
    4. Group similar tasks (Task Batching).
    5. Ensure high priority tasks are scheduled first.
    6. If the day is overbooked, suggest moving low priority tasks to tomorrow.
    7. The 'description' field in the JSON should use Gen Z slang, be hype, and fun. Examples: "Main character energy for this one", "Go touch grass", "We ball", "Academic weapon mode", "No cap, this needs doing".
    
    Return a JSON array representing the schedule.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scheduleSchema,
        temperature: 0.3, 
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Add unique IDs to schedule items if not present
    return data.map((item: any, index: number) => ({
      ...item,
      id: `sched-${index}-${Date.now()}`
    }));

  } catch (error) {
    console.error("Error generating schedule:", error);
    // Fallback or rethrow
    throw new Error("Failed to generate schedule");
  }
};

export const breakDownComplexTask = async (taskDescription: string): Promise<any[]> => {
  const prompt = `
    The user has a complex task: "${taskDescription}".
    Break this down into 3-6 smaller, actionable sub-tasks.
    
    For each sub-task, estimate:
    - Duration (minutes)
    - Priority (High/Medium/Low)
    - Energy Required (High/Medium/Low)
    - Category (Work, Study, Health, Personal, Break)
    
    Keep the titles concise and actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: subTaskSchema,
        temperature: 0.4,
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error breaking down task:", error);
    throw new Error("Failed to break down task");
  }
};

export const getMotivationalNudge = async (completedCount: number, remainingCount: number): Promise<string> => {
  const prompt = `
    The user has completed ${completedCount} tasks and has ${remainingCount} left.
    Give a short, Gen Z style motivational quote (max 1 sentence).
    Use slang like 'locked in', 'cooked', 'main character', 'W', 'L', 'bet', 'no cap', 'slay', 'touch grass'.
    Example: "You're entering your academic weapon era, no cap."
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || "Stay focused, bestie.";
  } catch (e) {
    return "Focus aligned.";
  }
};

export const generateScheduleInfographic = async (schedule: ScheduleItem[]): Promise<string> => {
  const scheduleText = schedule.map(s => `${s.timeSlot}: ${s.title} (${s.category})`).join('\n');
  
  const prompt = `
    Create a simple, interesting, and aesthetic infographic timetable for the following schedule.
    
    Style:
    - Dark mode background (slate/black/dark blue)
    - Gen Z Aesthetic: Neon accents, clean lines, maybe a bit cyberpunk or retro-futuristic.
    - Layout: Optimize for a 16:9 Landscape view. Use a horizontal timeline or a grid layout.
    - Font: Bold, legible, sans-serif.
    - Title: "LOCK IN DAILY LOG"
    
    Content to visualize:
    ${scheduleText}
    
    Make it look like a cool HUD or a stats screen from a video game.
  `;

  try {
    const response = await ai.models.generateContent({
      model: imageModelName,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating infographic:", error);
    throw error;
  }
};

export const roastSchedule = async (schedule: ScheduleItem[]): Promise<string> => {
  if (schedule.length === 0) return "You have no schedule. That's the biggest L of all. Do something.";
  
  const prompt = `
    Look at this schedule and ROAST the user. Be savage, funny, and use Gen Z slang.
    Call them out for bad habits (too many breaks, unrealistic work blocks, weird task combos).
    Tell them if they are "cooked" or "delusional".
    
    Schedule:
    ${JSON.stringify(schedule)}
    
    Keep it under 3 sentences. Make it hurt (but funny).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || "Your schedule is so mid I can't even roast it.";
  } catch (e) {
    return "Error generating roast. You got lucky.";
  }
};

export const summarizeYap = async (text: string): Promise<{summary: string, tasks: {title: string, priority: string}[]}> => {
  const prompt = `
    Read this "Yap session" (brain dump/journal entry).
    1. Summarize the vibe in 1 sentence using slang.
    2. Extract actionable tasks if there are any hidden in the text.
    
    Text: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: yapSchema
      }
    });
    return JSON.parse(response.text || '{"summary": "Just yapping.", "tasks": []}');
  } catch (e) {
    return { summary: "Couldn't read the yap.", tasks: [] };
  }
};

export const importPlaylistFromUrl = async (url: string): Promise<{playlistTitle: string, videos: {title: string, number: number}[]}> => {
  const prompt = `
    I need to extract video titles from a YouTube playlist.
    URL: ${url}
    
    Using Google Search, find the playlist title and the list of video titles contained in it.
    
    Return the result as a valid JSON object with the following structure:
    {
      "playlistTitle": "The Playlist Title",
      "videos": [
        { "title": "First Video Title", "number": 1 },
        { "title": "Second Video Title", "number": 2 }
      ]
    }
    
    Do not include any markdown formatting, just the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "{}";
    
    // Attempt to clean markdown if the model ignores the instruction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error importing playlist:", error);
    // Return a fallback structure instead of throwing, or throw nicely
    throw new Error("Failed to extract playlist data. Ensure it's a valid public URL.");
  }
};
