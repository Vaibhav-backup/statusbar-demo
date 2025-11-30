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

export const generateSmartSchedule = async (
  tasks: Task[], 
  profile: UserProfile, 
  context: string = "Initial planning"
): Promise<ScheduleItem[]> => {
  
  if (tasks.length === 0) return [];

  const prompt = `
    You are Statusbar, an advanced AI productivity scheduler with a Gen Z personality.
    
    User Profile:
    - Wake up: ${profile.wakeUpTime}
    - Sleep: ${profile.sleepTime}
    - Peak Productivity: ${profile.productiveHours}

    Context: ${context}

    Tasks to schedule:
    ${JSON.stringify(tasks)}

    Goal: Create an optimized daily timeline.
    Rules:
    1. Respect the user's wake and sleep times.
    2. Place High priority/High energy tasks during peak productivity hours (The "Locked In" hours).
    3. Insert short breaks (5-15 mins) between deep work sessions. Call them "Touch Grass" or "Vibe Check".
    4. Group similar tasks (Task Batching) where possible.
    5. Ensure high priority tasks are scheduled first.
    6. If the day is overbooked, suggest moving low priority tasks to tomorrow (but do not schedule them today).
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
    
    Keep the titles concise and actionable. Use a bit of Gen Z flair if appropriate but keep it clear.
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
    
    Content to visualize:
    ${scheduleText}
    
    Make it look like a cool HUD or a stats screen from a video game.
    Do not include too much text, just the times and the task titles.
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