// Minimal local "genkit" stub for development. Replace with the real library when available.
type PromptDef = {
  name: string;
  input?: any;
  output?: any;
  prompt: string;
};

export const ai = {
  definePrompt: (def: PromptDef) => {
    // returns an async function that accepts input and returns { output }
    return async (inputData: any) => {
      const question = (inputData && (inputData.question || inputData.input?.question)) || '';
      // Very simple canned answer. You can extend this to be fancier if needed.
      const answer = question
        ? `Commander, I cannot access the full tactical network in this environment. You asked: "${question}".`
        : `Commander, how may I assist you?`;
      return { output: { answer } };
    };
  },

  defineFlow: (_opts: { name?: string; inputSchema?: any; outputSchema?: any }, fn: (input: any) => Promise<any>) => {
    // return a flow function that simply forwards to the provided implementation
    return async (input: any) => {
      // If the provided fn expects the prompt stub to be available, allow it to run.
      return fn(input);
    };
  },
};
