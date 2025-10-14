import { onRequest } from "firebase-functions/v2/https";
import { ENV } from "./config.js";

export const ask = onRequest(async (req, res) => {
  const openaiKey = ENV("OPENAI_API_KEY");

  res.json({
    ok: true,
    message: "Smart Vision Function Works 🚀",
    hasOpenAI: !!openaiKey
  });
});
