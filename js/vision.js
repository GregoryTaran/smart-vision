// ==========================
// 🎤 Smart Vision — Voice to Whisper (pseudo-stream + overlap + live typing)
// ==========================

const button = document.createElement("button");
const output = document.createElement("div");
const container = document.querySelector(".vision-container");

button.textContent = "🎤 Говорить";
button.className = "voice-btn";
output.className = "vision-output";
container.appendChild(button);
container.appendChild(output);

let mediaRecorder;
let isRecording = false;
let lastChunk = null;
let partialText = "";

// Автовыбор адреса API (локально / прод)
const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5001/smart-vision-888/us-central1"
    : "https://us-central1-smart-vision-888.cloudfunctions.net";

// 🎬 Плавный вывод текста “вживую”
function typeText(newText) {
  const clean = newText.trim();
  if (!clean) return;

  const textToAdd = (partialText ? " " : "") + clean;
  let i = 0;

  const interval = setInterval(() => {
    if (i < textToAdd.length) {
      output.textContent += textToAdd[i];
      i++;
    } else {
      clearInterval(interval);
    }
  }, 25);

  partialText += clean;
}

// 🎧 Отправка чанка на Whisper
async function sendToWhisper(blob) {
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result.split(",")[1];
    try {
      const res = await fetch(`${API_BASE}/speakToWhisper`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64data, ext: "webm" }),
      });
      const data = await res.json();
      if (data.ok && data.text) {
        typeText(data.text);
      } else if (data.error) {
        console.warn("Ошибка Whisper:", data.error);
      }
    } catch (err) {
      console.error("Ошибка соединения:", err);
    }
  };
  reader.readAsDataURL(blob);
}

// 🟢 Главная логика кнопки
button.addEventListener("click", async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      partialText = "";
      output.textContent = "🎙 Слушаю...";
      lastChunk = null;

      // 🔁 Получаем аудио каждые 2 секунды
      mediaRecorder.start(2000);

      mediaRecorder.ondataavailable = async (e) => {
        const current = e.data;
        if (current.size === 0) return;

        let merged = current;

        // 🧩 Добавляем перекрытие 0.5 сек из предыдущего чанка
        if (lastChunk) {
          const overlap = lastChunk.slice(-500000); // ≈ 0.5 сек
          merged = new Blob([overlap, current], { type: "audio/webm" });
        }

        sendToWhisper(merged);
        lastChunk = current;
      };

      mediaRecorder.onstop = () => {
        button.textContent = "🎤 Говорить";
        button.classList.remove("active");
      };

      isRecording = true;
      button.textContent = "⏹ Остановить";
      button.classList.add("active");
    } catch (err) {
      console.error("Ошибка микрофона:", err);
      alert("⚠️ Микрофон недоступен");
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
  }
});
