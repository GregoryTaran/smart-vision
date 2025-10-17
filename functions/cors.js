// --- Smart Vision Universal CORS Config ---
// Этот модуль подключается ко всем Cloud Functions
// и навсегда разрешает все твои домены и поддомены.

export function setCORS(res, req) {
  // Разрешаем все сайты smartvision.life и web.app
  const ALLOWED_PATTERNS = [
    /\.smartvision\.life$/,
    /\.web\.app$/
  ];

  const origin = req.headers.origin || "";
  const isAllowed = ALLOWED_PATTERNS.some((pattern) => pattern.test(origin));

  if (isAllowed) {
    res.set("Access-Control-Allow-Origin", origin);
  }

  // Общие правила CORS
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Credentials", "true");

  // Обработка preflight-запроса (OPTIONS)
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true; // прерываем выполнение функции
  }

  return false; // продолжаем выполнение
}
