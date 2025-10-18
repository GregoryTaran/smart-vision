import { onRequest } from "firebase-functions/v2/https";
import { setCORS } from "./cors.js";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const saveUser = onRequest(async (req, res) => {
  if (setCORS(res, req)) return;

  try {
    if (req.method !== "POST")
      return res.status(405).json({ ok: false, error: "Use POST" });

    const { email, name } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: "Missing email" });

    const ref = db.collection("users").doc(email);
    await ref.set(
      {
        email,
        name: name || "Без имени",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ User saved: ${email}`);
    res.status(200).json({ ok: true, email });
  } catch (err) {
    console.error("saveUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
