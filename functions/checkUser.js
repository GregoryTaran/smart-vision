import { onRequest } from "firebase-functions/v2/https";
import { setCORS } from "./cors.js";
import admin from "firebase-admin";

// Инициализация Firebase Admin (один раз на весь проект)
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// === Smart Vision — Проверка пользователя ===
// Работает и с GET, и с POST для тестов
export const checkUser = onRequest(async (req, res) => {
  // Разрешаем CORS
  if (setCORS(res, req)) return;

  try {
    let email;

    // ✅ Разрешаем оба метода
    if (req.method === "GET") {
      email = req.query.email;
    } else if (req.method === "POST") {
      email = req.body?.email;
    } else {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    if (!email) {
      return res.status(400).json({ ok: false, error: "Missing email" });
    }

    // 🔍 Ищем пользователя в Firestore
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      console.log(`⚠️ Пользователь ${email} не найден`);
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log(`✅ Пользователь найден: ${email}`);
    return res.status(200).json({ ok: true, user: userData });
  } catch (err) {
    console.error("❌ checkUser error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});
