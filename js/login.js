import { userStorage } from "./user.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");

  const existing = userStorage.get();
  if (existing && existing.isLoggedIn) {
    window.location.href = "/html/dashboard.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const name = nameInput.value.trim().slice(0, 30);

    try {
      // 🔍 Проверяем, есть ли пользователь
      const check = await fetch("https://us-central1-smart-vision-888.cloudfunctions.net/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await check.json();

      if (result.exists) {
        console.log("Пользователь найден:", result.user);
      } else {
        console.log("Новый пользователь, создаём запись...");
        await fetch("https://us-central1-smart-vision-888.cloudfunctions.net/saveUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
      }

      // 💾 Сохраняем локально
      const user = {
        email,
        name: name || result.user?.name || "Anonymous",
        isLoggedIn: true,
        updatedAt: new Date().toISOString(),
      };
      userStorage.save(user);
      window.location.href = "/html/dashboard.html";
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      alert("Не удалось подключиться к серверу. Попробуй позже.");
    }
  });
});
