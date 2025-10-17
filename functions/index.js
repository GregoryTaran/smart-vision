import { onRequest } from "firebase-functions/v2/https";
import { ENV } from "./config.js";
import admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";

admin.initializeApp();
const storage = new Storage();

/**
 * Проверка базовой функции
 */
export const ask = onRequest(async (req, res) => {
  res.json({
    ok: true,
    message: "Smart Vision Function Works 🚀",
    hasOpenAI: !!ENV("OPENAI_API_KEY")
  });
});

/**
 * Сохранение пользователя в users.json (в Firebase Storage)
 */
export const saveUser = onRequest(async (req, res) => {
  try {
    const bucket = storage.bucket("smart-vision-888.firebasestorage.app");
    const file = bucket.file("users.json");

    // читаем существующих пользователей
    let users = [];
    try {
      const [content] = await file.download();
      users = JSON.parse(content.toString());
    } catch {
      users = [];
    }

    // добавляем нового пользователя
    const user = {
      name: req.body.name || "Anonymous",
      email: req.body.email || null,
      createdAt: new Date().toISOString()
    };
    users.push(user);

    // сохраняем обратно
    await file.save(JSON.stringify(users, null, 2), {
      contentType: "application/json"
    });

    res.json({ ok: true, user });
  } catch (error) {
    console.error("saveUser error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});
