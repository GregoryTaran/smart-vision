// --- Smart Vision Universal CORS Config ---
export function setCORS(res, req) {
  // Разрешаем все твои домены и поддомены
  const ALLOWED_PATTERNS = [
    /\.smartvision\.life$/,
    /\.web\.app$/
  ];

  const origin = req.headers.origin || "";
  const isAllowed = ALLOWED_PATTERNS.some((pattern) => pattern.test(origin));

  if (isAllowed) {
    res.set("Access-Control-Allow-Origin", origin);
  }

  // Разрешённые методы и заголовки
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Ответ для preflight-запроса
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true; // прерываем выполнение функции
  }

  return false; // продолжаем выполнение
}
