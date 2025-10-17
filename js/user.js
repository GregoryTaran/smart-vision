// Универсальное хранилище пользователя
export const userStorage = (() => {
  let storage;

  try {
    // Проверяем localStorage
    const test = "__test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    storage = localStorage;
  } catch (e) {
    // Если localStorage недоступен — используем sessionStorage
    storage = sessionStorage;
  }

  return {
    save(user) {
      storage.setItem("user", JSON.stringify(user));
    },
    get() {
      const data = storage.getItem("user");
      return data ? JSON.parse(data) : null;
    },
    clear() {
      storage.removeItem("user");
    }
  };
})();
