import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task, TaskPriority, TaskComplexity, TaskStatus } from "../types";

// Helper to format tasks for the prompt
const formatTasksForPrompt = (tasks: Task[]): string => {
  return JSON.stringify(tasks.map(t => ({
    id: t._id,
    title: t.title,
    deadline: t.deadline,
    priority: t.priority,
    complexity: t.complexity,
    status: t.status
  })));
};

export const getTaskSuggestions = async (tasks: Task[]): Promise<{ sortedIds: string[], reasoning: Record<string, string> }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Missing API_KEY in environment variables.");
      // Return dummy data if no key, just to prevent app crash in demo mode without key
      return {
        sortedIds: tasks.map(t => t._id),
        reasoning: tasks.reduce((acc, t) => ({ ...acc, [t._id]: "API Key missing. Default order." }), {})
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Filter only non-done tasks for prioritization
    const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
    
    if (pendingTasks.length === 0) {
      return { sortedIds: [], reasoning: {} };
    }

    const prompt = `
      You are an expert productivity assistant. I have a list of tasks.
      Please analyze them based on Deadline (closest first), Priority (High > Medium > Low), and Complexity.
      Complexity 'Easy' is good to start to build momentum, but 'Hard' tasks might need fresh energy.
      Balance these factors to suggest an optimal execution order.
      
      Here are the tasks:
      ${formatTasksForPrompt(pendingTasks)}
      
      Return a JSON array where each object contains the 'taskId' and a short 'reasoning' (in Vietnamese) explaining why this position was chosen.
    `;

    // Define the schema using the correct Type enum from @google/genai
    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskId: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: ["taskId", "reasoning"],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    const suggestions = JSON.parse(resultText) as Array<{ taskId: string, reasoning: string }>;

    const sortedIds = suggestions.map(s => s.taskId);
    const reasoningMap = suggestions.reduce((acc, curr) => {
      acc[curr.taskId] = curr.reasoning;
      return acc;
    }, {} as Record<string, string>);

    return { sortedIds, reasoning: reasoningMap };

  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    throw error;
  }
};