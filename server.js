import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URİ);
console.log("MongoDB")
import express from "express";
import "dotenv/config";
import Groq from "groq-sdk";
import session from "express-session";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "rb_secret_key",
    resave: false,
    saveUninitialized: true
  })
);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const USERS_FILE = "users.json";
let history = [];

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
  }
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "R💞B" });
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli" });
    }

    const users = readUsers();
    const userExists = users.find((u) => u.username === username);

    if (userExists) {
      return res.status(400).json({ message: "Bu kullanıcı zaten var" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
      username,
      password: hashedPassword
    });

    writeUsers(users);

    return res.json({ message: "Kayıt başarılı" });
  } catch (error) {
    console.error("REGISTER HATASI:", error);
    return res.status(500).json({ message: "Kayıt sırasında hata oluştu" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = readUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Şifre yanlış" });
    }

    req.session.user = username;

    return res.json({ message: "Giriş başarılı" });
  } catch (error) {
    console.error("LOGIN HATASI:", error);
    return res.status(500).json({ message: "Giriş sırasında hata oluştu" });
  }
});

app.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ loggedIn: false });
  }

  return res.json({
    loggedIn: true,
    username: req.session.user
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Çıkış yapıldı" });
  });
});

app.post("/chat", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ reply: "Önce giriş yapmalısın." });
    }

    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ reply: "Geçerli bir mesaj yaz." });
    }

    history.push({
      role: "user",
      content: userMessage
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Senin adın R💞B. Türkçe konuşan yardımsever bir yapay zekasın."
        },
        ...history
      ]
    });

    const reply =
      completion.choices?.[0]?.message?.content || "Cevap alınamadı.";

    history.push({
      role: "assistant",
      content: reply
    });

    res.json({ reply });
  } catch (error) {
    console.error("CHAT HATASI:", error);
    res.status(500).json({ reply: "AI şu anda cevap veremiyor." });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`R💞B çalışıyor: ${process.env.PORT || 3000}`);
});
const UserSchema = new mongoose.Schema({
  username: String,
  pasword: String
});

Const User = mongoose.model("User", UserSchema);