import { onRequest } from "firebase-functions/v2/https";
import { setCORS } from "./cors.js";
import { firebaseConfig } from "./config.js";

export const getFirebaseConfig = onRequest(async (req, res) => {
  // Устанавливаем CORS
  if (setCORS(res, req)) return;

  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    res.status(200).json({
      ok: true,
      config: firebaseConfig,
    });
  } catch (err) {
    console.error("❌ getFirebaseConfig error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
