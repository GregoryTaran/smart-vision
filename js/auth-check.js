// ✅ Единая проверка авторизации для всех страниц Smart Vision

export function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  const info = document.getElementById("user-info");
  const logout = document.getElementById("logout");

  // 🔹 Проверка авторизации
  if (!user || !user.email || !user.name) {
    window.location.href = "/html/login.html";
    return;
  }

  // 🔹 Отображение информации о пользователе
  if (info) info.textContent = `${user.name} (${user.email})`;

  // 🔹 Кнопка выхода
  if (logout) {
    logout.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "/html/login.html";
    });
  }
}

// Автоматический запуск при подключении
checkAuth();
