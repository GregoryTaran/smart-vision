// js/vision-call.js
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function setupVisionCalls({ db, usersList, audio, log }) {
  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  let pc = null;
  let localStream = null;
  let activeCallRef = null;
  const currentUserEmail = window.currentUser?.email;

  if (!currentUserEmail) {
    log("⚠️ Пользователь не найден (нет currentUser).");
    return;
  }

  const logMsg = msg => {
    log(msg);
    console.log(msg);
  };

  // 🔹 Инициализация соединения и микрофона
  async function initPeer() {
    pc = new RTCPeerConnection(servers);
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    pc.ontrack = e => {
      audio.srcObject = e.streams[0];
      logMsg("🎧 Получен аудиопоток");
    };
    return pc;
  }

  // 🔹 Загрузка списка пользователей
  async function loadUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    usersList.innerHTML = "";
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.email && data.email !== currentUserEmail) {
        const div = document.createElement("div");
        div.className = "user-block";
        div.innerHTML = `
          <span>${data.email}</span>
          <button>📞 Позвонить</button>
        `;
        div.querySelector("button").onclick = () => callUser(data.email);
        usersList.appendChild(div);
      }
    });
  }

  // 🔹 Вызов пользователя
  async function callUser(emailTo) {
    logMsg(`🚀 Инициализация звонка: ${emailTo}...`);
    const pc = await initPeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const callRef = doc(collection(db, "calls"));
    activeCallRef = callRef;

    await setDoc(callRef, {
      from: currentUserEmail,
      to: emailTo,
      offer,
      status: "calling",
      createdAt: new Date().toISOString()
    });

    logMsg(`📨 Звонок отправлен пользователю: ${emailTo}`);

    onSnapshot(callRef, async snap => {
      const data = snap.data();
      if (data?.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(data.answer);
        logMsg("✅ Соединение установлено");
      }
      if (data?.status === "ended") {
        endCall(false);
      }
    });
  }

  // 🔹 Прослушка входящих звонков
  async function listenIncoming() {
    const callsRef = collection(db, "calls");
    onSnapshot(callsRef, async snapshot => {
      for (const change of snapshot.docChanges()) {
        const data = change.doc.data();
        if (data.to === currentUserEmail && data.offer && !data.answer) {
          logMsg(`📞 Входящий звонок от ${data.from}`);
          const pc = await initPeer();
          await pc.setRemoteDescription(data.offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          activeCallRef = change.doc.ref;
          await updateDoc(change.doc.ref, {
            answer,
            status: "connected",
            answeredAt: new Date().toISOString()
          });
          logMsg("📡 Ответ отправлен");
        }
      }
    });
  }

  // 🔹 Завершить звонок
  async function endCall(sendUpdate = true) {
    if (pc) {
      pc.close();
      pc = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    if (sendUpdate && activeCallRef) {
      await updateDoc(activeCallRef, {
        status: "ended",
        endedAt: new Date().toISOString()
      });
    }
    logMsg("📴 Звонок завершён");
  }

  // 🔹 Управление микрофоном
  document.getElementById("muteBtn").onclick = () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    document.getElementById("muteBtn").textContent = track.enabled
      ? "🔇 Выключить микрофон"
      : "🎙 Включить микрофон";
    logMsg(track.enabled ? "🎙 Микрофон включён" : "🔇 Микрофон выключен");
  };

  // 🔹 Кнопка завершения
  document.getElementById("endBtn").onclick = () => {
    endCall();
  };

  await loadUsers();
  await listenIncoming();
  logMsg("🔗 Готов к звонкам");
}
