const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");

// Unique session ID per page load — stored in sessionStorage so refresh resets it
let sessionId = sessionStorage.getItem("sessionId");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem("sessionId", sessionId);
}

// Auto-resize textarea
inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + "px";
});

// Send on Enter (Shift+Enter = newline)
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

sendBtn.addEventListener("click", send);

function addMessage(role, text) {
  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

function setLoading(on) {
  inputEl.disabled = on;
  sendBtn.disabled = on;
}

async function send() {
  const text = inputEl.value.trim();
  if (!text || inputEl.disabled) return;

  inputEl.value = "";
  inputEl.style.height = "auto";
  addMessage("user", text);
  setLoading(true);

  // Typing indicator
  const wrap = document.createElement("div");
  wrap.className = "message assistant";
  const dots = document.createElement("div");
  dots.className = "bubble typing";
  dots.innerHTML = "<span></span><span></span><span></span>";
  wrap.appendChild(dots);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: text }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    dots.className = "bubble";
    dots.textContent = data.reply;
  } catch (err) {
    dots.className = "bubble error";
    dots.textContent = "Something went wrong. Please try again.";
    console.error(err);
  } finally {
    setLoading(false);
    inputEl.focus();
    chatEl.scrollTop = chatEl.scrollHeight;
  }
}

// Opening message
addMessage(
  "assistant",
  "Hi! I'm your Sales Discovery Assistant. Tell me about the prospect you're working with — who are they, what industry are they in, and what challenge are you trying to help them solve?"
);

inputEl.focus();
