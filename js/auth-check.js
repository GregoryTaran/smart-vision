// Smart Vision — Проверка пользователя через базу Firestore

async function checkAuth() {
  try {
    const raw = localStorage.getItem("user");
    let user = raw ? JSON.parse(raw) : null;

    if (!user?.email) throw new Error("No user in localStorage");

    // 🔹 Проверка на сервере
    const res = await fetch("https://us-central1-smart-vision-888.cloudfunctions.net/checkUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    const data = await res.json();
    if (!data.ok || !data.user) throw new Error("User not found in database");

    // 🔹 Обновляем локальный кэш
    localStorage.setItem("user", JSON.stringify(data.user));

    // 🔹 Обновляем интерфейс
    const infoEl = document.getElementById("user-info");
    if (infoEl) infoEl.textContent = `${data.user.name} (${data.user.email})`;

    console.log("✅ Auth verified:", data.user.email);
  } catch (err) {
    console.warn("🚪 Redirect to login:", err.message);
    localStorage.clear();
    window.location.href = "/html/login.html";
  }
}

window.addEventListener("DOMContentLoaded", checkAuth);
