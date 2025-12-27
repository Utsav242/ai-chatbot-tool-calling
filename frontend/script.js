const input = document.getElementById("input");
const chatContainer = document.getElementById("chat-container");
const askBtn = document.getElementById("ask");
const clearBtn = document.getElementById("clear-chat");
const charCount = document.getElementById("char-count");
const welcomeScreen = document.getElementById("welcome-screen");

const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)

input.addEventListener("keyup", handleEnter);
input.addEventListener("input", updateCharCount);
askBtn.addEventListener("click", handleAsk);
clearBtn.addEventListener("click", clearChat);

// Add click handlers for suggestion buttons
document.querySelectorAll('.suggestion-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const text = e.currentTarget.querySelector('.font-medium').textContent;
    input.value = text;
    await handleAsk();
  });
});

const loading = document.createElement("div");
loading.className = "my-6 animate-pulse-custom flex items-center gap-2 text-gray-400";
loading.innerHTML = `
  <div class="flex gap-1">
    <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
    <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
    <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
  </div>
  <span>AI is thinking...</span>
`;

function updateCharCount() {
  const length = input.value.length;
  charCount.textContent = `${length} / 2000`;
  
  if (length > 1800) {
    charCount.classList.add('text-red-400');
  } else {
    charCount.classList.remove('text-red-400');
  }
}

function clearChat() {
  if (confirm('Are you sure you want to clear the chat history?')) {
    // Remove all messages except welcome screen
    const messages = chatContainer.querySelectorAll('.chat-bubble-user, .chat-bubble-ai, .animate-slideUp');
    messages.forEach(msg => msg.remove());
    
    // Show welcome screen again
    if (welcomeScreen) {
      welcomeScreen.style.display = 'flex';
    }
  }
}

function hideWelcomeScreen() {
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

async function generate(text) {
  // Hide welcome screen on first message
  hideWelcomeScreen();

  // 1. Append user message to UI
  const msg = document.createElement("div");
  msg.className = `my-6 animate-slideUp flex flex-col items-end`;
  msg.innerHTML = `
    <div class="chat-bubble-user p-4 rounded-2xl rounded-tr-sm max-w-[80%] break-words">
      <div class="text-white">${escapeHtml(text)}</div>
    </div>
    <div class="text-xs text-gray-500 mt-1">${formatTime()}</div>
  `;
  chatContainer.appendChild(msg);
  input.value = "";
  updateCharCount();
  
  // Scroll to bottom
  scrollToBottom();
  
  // Show loading indicator
  chatContainer.appendChild(loading);
  scrollToBottom();

  // 2. Send to LLM and get response
  const assistantMessage = await callServer(text);

  // 3. Append AI response to UI
  const assistantMsgElem = document.createElement("div");
  assistantMsgElem.className = `my-6 animate-slideUp flex flex-col items-start`;
  assistantMsgElem.innerHTML = `
    <div class="flex items-start gap-3 max-w-[80%]">
      <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-lg">
        🤖
      </div>
      <div class="chat-bubble-ai p-4 rounded-2xl rounded-tl-sm break-words">
        <div class="text-white whitespace-pre-wrap">${escapeHtml(assistantMessage)}</div>
      </div>
    </div>
    <div class="text-xs text-gray-500 mt-1 ml-11">${formatTime()}</div>
  `;
  
  loading.remove();
  chatContainer.appendChild(assistantMsgElem);
  scrollToBottom();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function scrollToBottom() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
}

async function callServer(inputText) {
  try {
    const response = await fetch("http://localhost:3001/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threadId: threadId, message: inputText }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const result = await response.json();
    return result.message;
  } catch (error) {
    // Server is not running or network error
    console.error("Error connecting to server:", error);
    return "⚠️ Need to connect LLM - Please start the server by running: node --env-file=.env server.js";
  }
}
async function handleAsk(e) {
  const text = input?.value.trim();
  if (!text) {
    return;
  }
  await generate(text);

}
async function handleEnter(e) {
  if (e.key === "Enter") {
    const text = input?.value.trim();
    if (!text) {
      return;
    }
    await generate(text);
  }
}
