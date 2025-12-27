# InvokedLLM - AI Chatbot with Tool Calling

A powerful AI chatbot application built with **Groq API** that supports function calling (tool invocation) for web search capabilities using **Tavily Search API**.

## 🚀 Features

- **AI-Powered Chat**: Uses Groq's fast LLM inference with `llama-3.3-70b-versatile` model
- **Function Calling**: Implements tool calling/function calling pattern
- **Web Search Integration**: Real-time web search using Tavily API
- **Multi-Mode Support**:
  - CLI chatbot (`app.js`) - Interactive terminal-based chat
  - REST API server (`server.js`) - HTTP endpoints for chat integration
- **Conversation Management**: 
  - Thread-based conversations with caching
  - Memory persistence across requests
- **Frontend Interface**: Simple HTML/JS interface for web-based interaction

## 📁 Project Structure

```
InvokedLLM/
├── chatbot.js      # Core chatbot logic with tool invocation
├── server.js       # Express REST API server
├── frontend/
│   ├── index.html  # Web UI
│   └── script.js   # Frontend logic
├── package.json    # Dependencies
├── .env            # Environment variables (API keys)
└── README.md       # This file
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **LLM Provider**: [Groq](https://groq.com/) - Fast LLM inference
- **Model**: `llama-3.3-70b-versatile`
- **Search API**: [Tavily](https://tavily.com/) - AI-powered search
- **Backend Framework**: Express.js
- **Caching**: node-cache (in-memory conversation storage)
- **OpenAI SDK**: For Groq API compatibility
- **Frontend**: Vanilla HTML/CSS/JavaScript

## 📦 Dependencies

```json
{
  "@tavily/core": "^0.6.3",      // Tavily search API client
  "cors": "^2.8.5",              // CORS middleware
  "express": "^5.2.1",           // Web framework
  "groq-sdk": "^0.37.0",         // Groq SDK
  "node-cache": "^5.1.2",        // In-memory caching
  "openai": "^6.15.0"            // OpenAI-compatible client for Groq
}
```

## ⚙️ Setup & Installation

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Create `.env` File

Create a `.env` file in the root directory with your API keys:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**Get API Keys:**
- Groq API: https://console.groq.com/keys
- Tavily API: https://tavily.com/

### 3. Run the Application

#### Option A: CLI Chatbot (Interactive Terminal)

> Note: `app.js` (CLI chatbot) was removed from this repository. The primary supported runtime is the REST API server (`server.js`).

If you previously used a CLI interface, you can run simple interactions via the REST API (see Option B) or create your own small script that calls the `/chat` endpoint.

#### Option B: REST API Server

```bash
node --env-file=.env server.js
```

**Server runs on:** http://localhost:3001

**API Endpoints:**

1. **GET /** - Health check
   ```
   GET http://localhost:3001/
   Response: "WELCOME TO CHATGPT!"
   ```

2. **POST /chat** - Send chat message
   ```json
   POST http://localhost:3001/chat
   Content-Type: application/json
   
   {
     "message": "What is the weather in Delhi?",
     "threadId": "user-123"
   }
   
   Response:
   {
     "message": "The current weather in Delhi is..."
   }
   ```

#### Option C: Web Interface

1. Start the server:
   ```bash
   node --env-file=.env server.js
   ```

2. Open `frontend/index.html` in your browser
   - Or serve it with: `python3 -m http.server 8000` (in frontend folder)
   - Visit: http://localhost:8000

## 🔧 How It Works

### Function Calling (Tool Invocation)

The chatbot uses **function calling** pattern where the LLM can decide to invoke tools:

1. **User asks a question** → "What's the latest on AI?"
2. **LLM analyzes** → Determines if web search is needed
3. **Tool invocation** → Calls `search_web` function with Tavily
4. **Results returned** → Search results fed back to LLM
5. **Final response** → LLM generates answer based on search data

### Available Tools

- **search_web**: Searches the internet using Tavily API
  - Parameters: `query` (string)
  - Returns: Relevant search results and summaries

### Conversation Threading

- Each conversation has a unique `threadId`
- Messages are cached in-memory using `node-cache`
- Cache TTL: 1 hour (3600 seconds)
- Maintains context across multiple requests

## 📝 Key Features Explained

### 1. **Tool/Function Calling**
The bot can automatically decide when to search the web:
```javascript
tools: [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for current information",
      parameters: { ... }
    }
  }
]
```

### 2. **Streaming Responses** (app.js)
CLI version uses streaming for real-time responses:
```javascript
const stream = await groq.chat.completions.create({
  stream: true,
  // ...
});
```

### 3. **Conversation Memory**
Maintains chat history per thread:
```javascript
const cache = new NodeCache({ stdTTL: 3600 });
const messages = cache.get(threadId) ?? baseMessages;
```

## 🎯 Use Cases

- **Personal AI Assistant**: Answer questions with web search capability
- **Research Tool**: Get current information from the web
- **Customer Support**: Integrate into websites for intelligent chatbot
- **Learning Tool**: Understand function calling and LLM integration

## 🔍 Example Interactions

**Question requiring web search:**
```
User: What are the top tech news today?
Bot: [Automatically searches web] Here are today's top tech stories...
```

**Direct question:**
```
User: Explain quantum computing
Bot: [Uses trained knowledge] Quantum computing is...
```

**Tool calling visible in logs:**
```
Tool called: search_web
Arguments: {"query": "latest tech news 2025"}
```

## 🚨 Troubleshooting

### Error: `BadRequestError: 400 property 'message' is unsupported`
**Fix**: Use `messages` array instead of `message` string in API calls

### Error: `InsufficientQuotaError: 429`
**Fix**: Check your API key quota/limits on Groq/Tavily dashboard

### Server not starting
**Fix**: Ensure port 3001 is available or change in `server.js`

## 📚 Learning Resources

- [Groq Documentation](https://console.groq.com/docs)
- [Tavily API Docs](https://docs.tavily.com/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Express.js Guide](https://expressjs.com/)

## 🎓 What You've Learned

- ✅ Integrating LLMs with function calling
- ✅ Building CLI and REST API chatbots
- ✅ Using Groq for fast LLM inference
- ✅ Implementing web search in chatbots
- ✅ Managing conversation state with caching
- ✅ Creating frontend-backend chat systems

## 📄 License

ISC

## 👤 Author

Utsav Goel

---

**Happy Coding! 🚀**
