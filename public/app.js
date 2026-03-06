const chat = document.getElementById("chat");
const msg = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const typing = document.getElementById("typing");
const imageInput = document.getElementById("imageInput");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");

const STORAGE = "rb_chat_history";

async function checkAuth() {
  try {
    const res = await fetch("/me");
    const data = await res.json();

    if (!res.ok || !data.loggedIn) {
      window.location.href = "/login.html";
      return;
    }

    userInfo.textContent = `Giriş yapan: ${data.username}`;
  } catch {
    window.location.href = "/login.html";
  }
}

function saveMessages(messages) {
  localStorage.setItem(STORAGE, JSON.stringify(messages));
}

function loadMessages() {
  const data = localStorage.getItem(STORAGE);
  return data ? JSON.parse(data) : [];
}

function addMessage(text, type, save = true) {
  const div = document.createElement("div");
  div.className = "message " + type;
  div.innerHTML = text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (save) {
    const messages = loadMessages();
    messages.push({ text, type });
    saveMessages(messages);
  }
}

function renderSavedMessages() {
  chat.innerHTML = "";

  const messages = loadMessages();

  if (messages.length === 0) {
    addMessage("Merhaba, ben R💞B. Nasıl yardımcı olayım?", "bot");
    return;
  }

  messages.forEach((m) => {
    addMessage(m.text, m.type, false);
  });
}

async function sendMessage() {
  const message = msg.value.trim();

  if (!message) return;

  addMessage(message, "user");
  msg.value = "";
  typing.classList.remove("hidden");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    typing.classList.add("hidden");
    addMessage(data.reply || "Cevap alınamadı.", "bot");
  } catch {
    typing.classList.add("hidden");
    addMessage("Bağlantı hatası.", "bot");
  }
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  addMessage(`<img src="${url}">`, "user");
});

function newChat() {
  localStorage.removeItem(STORAGE);
  chat.innerHTML = "";
  addMessage("Yeni sohbet başladı. Ben R💞B.", "bot");
}

async function logout() {
  await fetch("/logout", {
    method: "POST"
  });

  window.location.href = "/login.html";
}

sendBtn.onclick = sendMessage;

msg.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

newChatBtn.onclick = newChat;
logoutBtn.onclick = logout;

checkAuth();
renderSavedMessages();