import { onRequest } from "firebase-functions/v2/https";
import { setCORS } from "./cors.js";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const checkUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    // ✅ Разрешаем оба метода
    let email;
    if (req.method === "GET") {
      email = req.query.email;
    } else if (req.method === "POST") {
      email = req.body?.email;
    } else {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    if (!email) return res.status(400).json({ ok: false, error: "Missing email" });

    const snap = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snap.empty) {
      console.log(`❌ User ${email} not found`);
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const user = snap.docs[0].data();
    console.log(`✅ User verified: ${user.email}`);
    return res.status(200).json({ ok: true, user });
  } catch (err) {
    console.error("checkUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
