export function setCORS(res, req) {
  const origin = req.headers.origin || "";

  // ✅ Разрешённые домены (все твои сайты + локалка)
  const ALLOWED = [
    /\.smartvision\.life$/,
    /\.web\.app$/,
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ];

  const isAllowed = ALLOWED.some((pattern) => {
    if (typeof pattern === "string") return origin === pattern;
    return pattern.test(origin);
  });

  if (isAllowed) {
    res.set("Access-Control-Allow-Origin", origin);
  }

  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }

  return false;
}
