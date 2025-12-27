import OpenAI from "openai";
import NodeCache from "node-cache";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const cache = new NodeCache({ stdTTL: 3600 }); // cache for 1 hour

export async function generate(userMessage, threadId) {
   
  
  const baseMessages = [
    {
      role: "system",
      content: `You are a smart personal assistant who answers the questions.
        `,
    },
    // {
    //   role: "user",
    //   content: "How can assist you?",
    // },
  ];

  const messages = cache.get(threadId) ?? baseMessages;

  messages.push({
    role: "user",
    content: userMessage,
  });

  // Preventing infinite loops
  const MAX_RETRIES = 10;
  let count = 0;

  // this loop for tool calling
  while (true) {
    if (count > MAX_RETRIES) {
      return "Max retries exceeded";
    }
    count++;

    const completions = await groq.chat.completions.create({
      // these are parameters
      temperature: 0,

      model: "openai/gpt-oss-20b",

      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description: "Search the latest information on the web",
            parameters: {
              // JSON Schema object
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    messages.push(completions.choices[0].message);

    const toolCalls = completions.choices[0].message.tool_calls;

    if (!toolCalls) {
      // If there are no tool calls, return the message content

      cache.set(threadId, messages);
      return completions.choices[0].message.content;
    }

    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName == "webSearch") {
        const toolResult = await webSearch(JSON.parse(functionParams));

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    }
  }
  
}

// travily web search for tool calling

async function webSearch({ query }) {
  const response = await tvly.search(query);
  console.log("Calling web searching");

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");

  return finalResult;
}

// webSearch({ query: "when was iphone 16 launched?" });
