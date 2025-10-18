// ✅ Smart Vision — Единая проверка авторизации для всех страниц

function checkAuth() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) {
      console.warn("⚠️ Нет сохранённого пользователя");
      window.location.href = "/html/login.html";
      return;
    }

    let user;
    try {
      user = JSON.parse(raw);
    } catch {
      console.warn("⚠️ Ошибка парсинга user JSON");
      window.location.href = "/html/login.html";
      return;
    }

    if (!user || !user.email) {
      console.warn("⚠️ Неверный объект пользователя");
      window.location.href = "/html/login.html";
      return;
    }

    // 🔹 Отображение информации
    const info = document.getElementById("user-info");
    const logout = document.getElementById("logout");
    if (info) info.textContent = `${user.name || "User"} (${user.email})`;

    if (logout) {
      logout.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "/html/login.html";
      });
    }

    window.currentUser = user;
    console.log("✅ Авторизация подтверждена:", user.email);

  } catch (err) {
    console.error("❌ Ошибка в checkAuth:", err);
    window.location.href = "/html/login.html";
  }
}

window.addEventListener("DOMContentLoaded", checkAuth);
